"""Adzuna job-board fetcher.

API docs: https://developer.adzuna.com/docs/search
"""

from __future__ import annotations

import logging
from typing import Any, ClassVar

import httpx

from ..config import get_settings
from ..models import Job
from ..normalizer import normalize_adzuna
from .base import BaseFetcher

logger = logging.getLogger(__name__)


class AdzunaFetcher(BaseFetcher):
    """Fetch and normalize jobs from the Adzuna search API."""

    source_name: ClassVar[str] = "adzuna"
    _BASE_URL: ClassVar[str] = "https://api.adzuna.com/v1/api/jobs/{country}/search/1"

    def __init__(self) -> None:
        self._settings = get_settings()

    async def fetch(self, skill: str, location: str, limit: int = 20) -> list[Job]:
        """Search Adzuna by keyword and location.

        Returns an empty list on any transport, auth, or rate-limit failure
        (with a logged error) so a single bad source can't crash a multi-source
        fan-out.
        """
        assert skill and skill.strip(), "skill must be a non-empty string"
        assert 1 <= limit <= 50, "limit must be between 1 and 50"

        settings = self._settings
        url = self._BASE_URL.format(country=settings.adzuna_country)
        params: dict[str, Any] = {
            "app_id": settings.adzuna_app_id,
            "app_key": settings.adzuna_app_key,
            "results_per_page": limit,
            "what": skill,
            "where": location,
            "content-type": "application/json",
        }

        timeout = settings.http_timeout_seconds
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(url, params=params)
        except httpx.TimeoutException:
            logger.error("Adzuna request timed out after %.1fs", timeout)
            return []
        except httpx.HTTPError as exc:
            logger.error("Adzuna network error: %s", exc)
            return []

        if response.status_code == 401:
            logger.error(
                "Adzuna returned 401 Unauthorized — your ADZUNA_APP_ID / "
                "ADZUNA_APP_KEY in backend/.env are wrong or revoked. "
                "Get fresh keys from https://developer.adzuna.com"
            )
            return []
        if response.status_code == 429:
            logger.error(
                "Adzuna rate limited (429). Free tier allows ~250 calls/month; "
                "wait before retrying."
            )
            return []
        if response.status_code >= 400:
            logger.error(
                "Adzuna returned HTTP %s: %s",
                response.status_code,
                response.text[:200],
            )
            return []

        try:
            payload: dict[str, Any] = response.json()
        except ValueError:
            logger.error("Adzuna returned non-JSON response (status %s)", response.status_code)
            return []

        raw_results = payload.get("results") or []
        jobs: list[Job] = []
        for entry in raw_results:
            try:
                jobs.append(normalize_adzuna(entry))
            except (AssertionError, ValueError, TypeError) as exc:
                logger.warning("Skipping malformed Adzuna entry: %s", exc)

        logger.info(
            "Adzuna returned %d normalized jobs (skill=%r, location=%r)",
            len(jobs),
            skill,
            location,
        )
        return jobs
