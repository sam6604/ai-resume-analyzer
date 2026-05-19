"""Score how well each Adzuna job matches a candidate's profile.

Single batched Gemini call: 1 prompt, N jobs in, N scores out.
Cheaper than per-job calls and keeps latency under ~5 s for 10 jobs.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from .config import get_settings

logger = logging.getLogger(__name__)

_DESC_TRUNC = 800  # chars per job description sent to Gemini
_MAX_REASON = 160  # chars per returned reason


def _build_prompt(profile: dict[str, Any], jobs: list[dict[str, Any]]) -> str:
    profile_json = json.dumps(profile, ensure_ascii=False, indent=2)
    jobs_json = json.dumps(jobs, ensure_ascii=False, indent=2)
    return f"""You are a senior recruiter. Score how well this candidate matches each
job posting on a 0-100 scale.

CANDIDATE PROFILE:
{profile_json}

JOBS TO SCORE:
{jobs_json}

Scoring rubric:
  80-100  strong match: most key skills present + experience level fits
  60-79   good match: many skills match, missing 1-2 important items
  40-59   partial match: some overlap, notable gaps
  0-39    weak match: different field, very junior/senior mismatch, or skill gaps

Return ONLY a JSON array (no prose, no backticks). Each element must have:
  - "id":           the job id, copied exactly from input
  - "match_score":  integer 0-100
  - "reason":       one short sentence (max ~25 words) explaining the score

Do not invent skills the candidate doesn't have. Be calibrated — most real
matches sit in the 50-80 range; reserve 90+ for jobs that fit almost perfectly.
"""


def _sync_score(profile: dict[str, Any], jobs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    assert isinstance(profile, dict), "profile must be a dict"
    assert isinstance(jobs, list), "jobs must be a list"

    if not jobs:
        return []

    # Compact representation — only id/title/description, no salary/url noise.
    compact_jobs: list[dict[str, str]] = []
    for j in jobs:
        if not isinstance(j, dict):
            continue
        jid = str(j.get("id", "")).strip()
        if not jid:
            continue
        compact_jobs.append(
            {
                "id": jid,
                "title": str(j.get("title", ""))[:200],
                "description": str(j.get("description", ""))[:_DESC_TRUNC],
            }
        )
    if not compact_jobs:
        return []

    settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key)

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[_build_prompt(profile, compact_jobs)],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3,
            ),
        )
    except genai_errors.ClientError as exc:
        status = getattr(exc, "status_code", "??")
        msg = str(exc)
        logger.exception("Job scorer ClientError (status=%s)", status)
        if status == 429 or "RESOURCE_EXHAUSTED" in msg:
            raise RuntimeError(
                f"Gemini quota exhausted for model '{settings.gemini_model}'."
            ) from exc
        raise RuntimeError(f"Gemini API error ({status}): {msg[:300]}") from exc
    except Exception as exc:
        logger.exception("Unexpected job scorer failure")
        raise RuntimeError(f"Job scorer error: {type(exc).__name__}: {str(exc)[:300]}") from exc

    raw = (response.text or "").strip()
    if not raw:
        raise RuntimeError("Gemini returned an empty response")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Job scorer returned invalid JSON.\n%s", raw[:500])
        raise RuntimeError(f"Job scorer: invalid JSON: {exc}") from exc

    if not isinstance(parsed, list):
        raise RuntimeError(f"Job scorer expected array, got {type(parsed).__name__}")

    out: list[dict[str, Any]] = []
    for entry in parsed:
        if not isinstance(entry, dict):
            continue
        jid = str(entry.get("id", "")).strip()
        if not jid:
            continue
        try:
            score = int(entry.get("match_score", 0))
        except (TypeError, ValueError):
            score = 0
        score = max(0, min(100, score))
        reason = str(entry.get("reason", ""))[:_MAX_REASON]
        out.append({"id": jid, "match_score": score, "reason": reason})
    return out


async def score_jobs(profile: dict[str, Any], jobs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return [{id, match_score, reason}, ...] for the supplied profile + jobs."""
    return await asyncio.to_thread(_sync_score, profile, jobs)
