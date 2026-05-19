"""Convert raw job-board responses into the unified :class:`~job_matcher.models.Job` schema.

One ``normalize_<source>`` function per fetcher. Keeping these as plain
functions (rather than methods on the fetcher) makes them trivially
testable without network or fixtures.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime
from typing import Any

from .models import Job

logger = logging.getLogger(__name__)

_TAG_RE = re.compile(r"<[^>]+>")
_WHITESPACE_RE = re.compile(r"\s+")


def _strip_html(text: str | None) -> str:
    """Remove HTML tags and collapse whitespace. Returns ``""`` for None."""
    if not text:
        return ""
    return _WHITESPACE_RE.sub(" ", _TAG_RE.sub(" ", text)).strip()


def _parse_iso8601(value: str | None) -> datetime | None:
    """Parse an ISO-8601 timestamp; log and return None on failure."""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        logger.warning("Could not parse posted date: %r", value)
        return None


def normalize_adzuna(raw: dict[str, Any]) -> Job:
    """Convert one entry from ``response.results`` of the Adzuna search API into a :class:`Job`."""
    assert isinstance(raw, dict), "Adzuna result must be a dict"
    entry_id = raw.get("id")
    assert entry_id, "Adzuna result missing required 'id' field"

    location_block = raw.get("location") or {}
    company_block = raw.get("company") or {}

    return Job(
        id=f"adzuna_{entry_id}",
        source="adzuna",
        title=(raw.get("title") or "Untitled").strip(),
        company=(company_block.get("display_name") or "Unknown").strip(),
        location=(location_block.get("display_name") or "Unknown").strip(),
        description=_strip_html(raw.get("description")),
        url=str(raw.get("redirect_url") or ""),
        salary_min=raw.get("salary_min"),
        salary_max=raw.get("salary_max"),
        salary_currency=raw.get("salary_currency"),
        posted_at=_parse_iso8601(raw.get("created")),
        raw=raw,
    )
