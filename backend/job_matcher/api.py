"""HTTP wrapper around the job_matcher fetchers and the resume analyzer.

Run with::

    uvicorn job_matcher.api:app --reload --port 8000

The React dev server proxies ``/api/*`` to this port (see ``vite.config.ts``).
"""

from __future__ import annotations

import logging
from typing import Annotated, Any

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .analyzer import analyze_resume
from .fetchers import AdzunaFetcher, BaseFetcher
from .models import Job

logger = logging.getLogger(__name__)

_FETCHERS: dict[str, type[BaseFetcher]] = {
    "adzuna": AdzunaFetcher,
}

_MAX_PDF_BYTES = 20 * 1024 * 1024  # 20 MB

app = FastAPI(
    title="job_matcher",
    version="0.2.0",
    description="Job retrieval, normalization, and resume analysis for the AI Resume Analyzer.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok"}


@app.get("/api/jobs", response_model=list[Job], response_model_exclude={"raw"})
async def get_jobs(
    skill: Annotated[str, Query(min_length=1, description="Skill or job title to search for.")],
    location: Annotated[str, Query(min_length=1, description="City or 'remote'.")] = "india",
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    source: Annotated[str, Query(description="Job board to query.")] = "adzuna",
) -> list[Job]:
    """Search a single job board and return normalized results."""
    if source not in _FETCHERS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown source '{source}'. Available: {sorted(_FETCHERS)}",
        )

    fetcher = _FETCHERS[source]()
    jobs = await fetcher.fetch(skill=skill, location=location, limit=limit)
    logger.info(
        "API /api/jobs returned %d jobs (skill=%r, location=%r, source=%r)",
        len(jobs),
        skill,
        location,
        source,
    )
    return jobs


@app.post("/api/analyze")
async def analyze(
    file: Annotated[UploadFile, File(description="Resume PDF")],
    prompt: Annotated[str, Form(description="Full instruction prompt assembled by the frontend.")],
) -> dict[str, Any]:
    """Analyze a resume PDF against a prompt and return structured feedback.

    The frontend assembles the prompt (with the response schema and the
    job description embedded) and POSTs it together with the PDF. The
    backend forwards both to Gemini and returns the JSON unchanged so
    the frontend's existing ``Feedback`` type still matches.
    """
    if file.content_type and "pdf" not in file.content_type.lower():
        raise HTTPException(status_code=400, detail=f"Expected a PDF, got {file.content_type!r}")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(pdf_bytes) > _MAX_PDF_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"PDF too large ({len(pdf_bytes)} bytes); max is {_MAX_PDF_BYTES}.",
        )
    if not prompt.strip():
        raise HTTPException(status_code=400, detail="prompt must not be empty.")

    try:
        feedback = await analyze_resume(pdf_bytes, prompt)
    except RuntimeError as exc:
        logger.exception("Gemini analysis failed")
        # 429 if the analyzer surfaced a quota error; otherwise 502 (upstream issue).
        msg = str(exc)
        is_quota = "quota" in msg.lower() or "exhaust" in msg.lower()
        raise HTTPException(status_code=429 if is_quota else 502, detail=msg) from exc

    logger.info(
        "API /api/analyze returned feedback (pdf=%d bytes, prompt=%d chars)",
        len(pdf_bytes),
        len(prompt),
    )
    return feedback
