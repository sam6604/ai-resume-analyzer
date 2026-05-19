"""Extracts a compact, machine-friendly profile from a resume PDF.

The profile is later used by :mod:`job_matcher.job_scorer` to compute a
match score against each Adzuna job. Keeping the profile small (~hundreds
of tokens, not the full PDF) means we can score 10 jobs in one Gemini
call instead of re-sending the full PDF every time the user refreshes.
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

_SCHEMA_HINT = """{
  "summary":         "1-2 sentence professional summary",
  "top_skills":      ["string", "string", ...],
  "years_experience":"approx years as a string, e.g. '5', '0-1', 'student'",
  "key_strengths":   ["string", ...],
  "domains":         ["string", ...]
}"""


def _build_prompt() -> str:
    return f"""You are a recruiting assistant. Extract a compact profile from the
attached resume PDF. Be concise — every field will be re-sent in future API
calls to score job matches.

Return ONLY a JSON object matching this schema (no prose, no backticks):
{_SCHEMA_HINT}

Field guidance:
- summary: who they are professionally in 1-2 sentences (no fluff)
- top_skills: 5-12 specific skills/technologies, lowercase if technical (e.g. "python", "react", "stakeholder management")
- years_experience: best estimate; "0-1" or "student" if entry-level
- key_strengths: 3-5 differentiators (e.g. "led 5-person team", "shipped 0-to-1 product")
- domains: industries/domains of experience (e.g. "fintech", "saas", "education")
"""


def _sync_extract(pdf_bytes: bytes) -> dict[str, Any]:
    assert pdf_bytes, "pdf_bytes must be non-empty"

    settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key)

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[
                types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
                _build_prompt(),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
    except genai_errors.ClientError as exc:
        status = getattr(exc, "status_code", "??")
        msg = str(exc)
        logger.exception("Profile extractor ClientError (status=%s)", status)
        if status == 429 or "RESOURCE_EXHAUSTED" in msg:
            raise RuntimeError(
                f"Gemini quota exhausted for model '{settings.gemini_model}'."
            ) from exc
        if status == 404 or "NOT_FOUND" in msg:
            raise RuntimeError(
                f"Gemini model '{settings.gemini_model}' not available."
            ) from exc
        raise RuntimeError(f"Gemini API error ({status}): {msg[:300]}") from exc
    except Exception as exc:
        logger.exception("Unexpected profile extractor failure")
        raise RuntimeError(f"Profile extractor error: {type(exc).__name__}: {str(exc)[:300]}") from exc

    raw = (response.text or "").strip()
    if not raw:
        raise RuntimeError("Gemini returned an empty response")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Profile extractor returned invalid JSON.\n%s", raw[:500])
        raise RuntimeError(f"Profile extractor: invalid JSON: {exc}") from exc

    if not isinstance(parsed, dict):
        raise RuntimeError(f"Profile extractor expected object, got {type(parsed).__name__}")

    # Coerce/clamp into the expected shape so the scorer can trust it.
    return {
        "summary": str(parsed.get("summary", ""))[:600],
        "top_skills": [str(s) for s in (parsed.get("top_skills") or []) if s][:15],
        "years_experience": str(parsed.get("years_experience", ""))[:30],
        "key_strengths": [str(s) for s in (parsed.get("key_strengths") or []) if s][:8],
        "domains": [str(s) for s in (parsed.get("domains") or []) if s][:8],
    }


async def extract_profile(pdf_bytes: bytes) -> dict[str, Any]:
    """Return a compact resume profile for downstream job scoring."""
    return await asyncio.to_thread(_sync_extract, pdf_bytes)
