"""Resume analysis via the Google Gemini API.

Takes a PDF resume (raw bytes) plus an instruction prompt and returns the
parsed feedback JSON. The prompt is supplied by the frontend so the prompt
template can live next to the existing UI without duplication on the server.

We rely on Gemini's structured output mode (``response_mime_type="application/json"``)
to guarantee parseable JSON — that's why we don't need the ``json``-fence
stripping the old browser-side path had.
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


def _build_client() -> genai.Client:
    return genai.Client(api_key=get_settings().gemini_api_key)


def _sync_analyze(pdf_bytes: bytes, prompt: str) -> dict[str, Any]:
    """Blocking Gemini call. Wrapped in :func:`asyncio.to_thread` by callers."""
    assert pdf_bytes, "pdf_bytes must be non-empty"
    assert prompt and prompt.strip(), "prompt must be non-empty"

    settings = get_settings()
    client = _build_client()

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
        # 4xx — usually quota / auth / bad model.
        status = getattr(exc, "status_code", "??")
        msg = str(exc)
        logger.exception("Gemini ClientError (status=%s)", status)
        if status == 429 or "RESOURCE_EXHAUSTED" in msg:
            raise RuntimeError(
                f"Gemini quota exhausted for model '{settings.gemini_model}'. "
                "Wait ~60s, or set GEMINI_MODEL to a different flash variant in backend/.env."
            ) from exc
        if status == 404 or "NOT_FOUND" in msg:
            raise RuntimeError(
                f"Gemini model '{settings.gemini_model}' not available for your API key. "
                "Try 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', or 'gemini-flash-lite-latest'."
            ) from exc
        if status == 401 or status == 403 or "UNAUTHENTICATED" in msg or "PERMISSION_DENIED" in msg:
            raise RuntimeError(
                "Gemini rejected the API key (auth error). Check GEMINI_API_KEY in backend/.env."
            ) from exc
        raise RuntimeError(f"Gemini API error ({status}): {msg[:300]}") from exc
    except genai_errors.ServerError as exc:
        logger.exception("Gemini ServerError")
        raise RuntimeError(f"Gemini server error: {str(exc)[:300]}") from exc
    except Exception as exc:
        # Catch-all so unexpected library errors still surface a useful message
        # instead of becoming a generic 500.
        logger.exception("Unexpected Gemini failure")
        raise RuntimeError(f"Unexpected analyzer error: {type(exc).__name__}: {str(exc)[:300]}") from exc

    raw = (response.text or "").strip()
    if not raw:
        raise RuntimeError("Gemini returned an empty response")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Gemini returned invalid JSON despite structured output mode.\n%s", raw[:500])
        raise RuntimeError(f"Gemini returned invalid JSON: {exc}") from exc

    if not isinstance(parsed, dict):
        raise RuntimeError(f"Gemini returned non-object JSON: {type(parsed).__name__}")

    return parsed


async def analyze_resume(pdf_bytes: bytes, prompt: str) -> dict[str, Any]:
    """Run the resume analysis off the event loop so FastAPI stays responsive."""
    return await asyncio.to_thread(_sync_analyze, pdf_bytes, prompt)
