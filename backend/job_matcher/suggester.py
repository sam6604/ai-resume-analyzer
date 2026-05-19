"""Targeted bullet/phrase rewrite suggestions via Gemini.

Sibling to ``analyzer.py`` but returns a list of concrete edit suggestions
(original phrase, improved rewrite, one-line reason) instead of the broader
scoring rubric. This powers the "Suggested Edits" panel on the resume page.

We intentionally keep this as a separate Gemini call rather than merging
it into ``analyze_resume``, so:
  - the existing Feedback schema in the frontend stays untouched
  - the two calls can be fan-ed out in parallel from the browser
  - prompt iteration on one doesn't risk breaking the other
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

_SCHEMA_HINT = """[
  {
    "section": "string — where in the resume, e.g. 'Experience > Acme Corp'",
    "original": "string — exact verbatim text from the resume",
    "suggested": "string — improved rewrite, ideally STAR/XYZ format with a metric",
    "reason": "string — one short sentence on why the change helps"
  }
]"""


def _build_prompt(job_title: str, job_description: str) -> str:
    return f"""You are an expert resume editor.

Below is a candidate's resume PDF. Their target role is **{job_title or "the role described below"}**.

Job description:
{job_description.strip() or "(none provided — focus on general resume quality)"}

Your task: identify 5 to 8 specific phrases or bullet points from the resume that
should be rewritten to better match the target role. For each one, return:
  - section: where it appears (best-effort, e.g. "Experience > Company X", "Summary", "Skills")
  - original: the exact text copied verbatim from the resume
  - suggested: an improved rewrite. Prefer STAR or XYZ structure, strong action verbs, and quantifiable impact when possible. Keep the rewrite roughly the same length so it remains a realistic substitution.
  - reason: one short sentence explaining the improvement (e.g., "adds quantifiable impact", "stronger action verb", "ties to JD requirement: TypeScript")

Return ONLY a JSON array matching this schema, no prose:
{_SCHEMA_HINT}
"""


def _sync_suggest(pdf_bytes: bytes, job_title: str, job_description: str) -> list[dict[str, Any]]:
    assert pdf_bytes, "pdf_bytes must be non-empty"

    settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = _build_prompt(job_title, job_description)

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[
                types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.4,
            ),
        )
    except genai_errors.ClientError as exc:
        status = getattr(exc, "status_code", "??")
        msg = str(exc)
        logger.exception("Gemini ClientError in suggester (status=%s)", status)
        if status == 429 or "RESOURCE_EXHAUSTED" in msg:
            raise RuntimeError(
                f"Gemini quota exhausted for model '{settings.gemini_model}'. "
                "Wait ~60s or switch GEMINI_MODEL in backend/.env."
            ) from exc
        if status == 404 or "NOT_FOUND" in msg:
            raise RuntimeError(
                f"Gemini model '{settings.gemini_model}' not available. "
                "Try 'gemini-2.5-flash-lite' or 'gemini-2.0-flash-lite'."
            ) from exc
        raise RuntimeError(f"Gemini API error ({status}): {msg[:300]}") from exc
    except Exception as exc:
        logger.exception("Unexpected suggester failure")
        raise RuntimeError(f"Unexpected suggester error: {type(exc).__name__}: {str(exc)[:300]}") from exc

    raw = (response.text or "").strip()
    if not raw:
        raise RuntimeError("Gemini returned an empty response")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Suggester returned invalid JSON.\n%s", raw[:500])
        raise RuntimeError(f"Gemini returned invalid JSON: {exc}") from exc

    if not isinstance(parsed, list):
        raise RuntimeError(f"Suggester expected an array, got {type(parsed).__name__}")

    # Defensive: filter out malformed entries instead of failing the whole batch.
    clean: list[dict[str, Any]] = []
    for entry in parsed:
        if not isinstance(entry, dict):
            continue
        section = str(entry.get("section") or "").strip()
        original = str(entry.get("original") or "").strip()
        suggested = str(entry.get("suggested") or "").strip()
        reason = str(entry.get("reason") or "").strip()
        if not original or not suggested:
            continue
        clean.append(
            {
                "section": section or "General",
                "original": original,
                "suggested": suggested,
                "reason": reason,
            }
        )

    return clean


async def suggest_edits(pdf_bytes: bytes, job_title: str, job_description: str) -> list[dict[str, Any]]:
    """Return a list of concrete edit suggestions for the given resume PDF."""
    return await asyncio.to_thread(_sync_suggest, pdf_bytes, job_title, job_description)
