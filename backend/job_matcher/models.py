"""Pydantic schemas shared across the job_matcher package."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

Source = Literal["adzuna", "jooble", "remotive"]


class Job(BaseModel):
    """A normalized job posting from any supported source.

    All fetchers must convert their raw payloads into this shape via
    :mod:`job_matcher.normalizer`. The original API response is preserved
    in :attr:`raw` for debugging and for fields we may want to use later
    without re-fetching.
    """

    model_config = ConfigDict(extra="forbid")

    id: str = Field(..., min_length=1, description="Source-prefixed unique id, e.g. 'adzuna_12345'.")
    source: Source = Field(..., description="Which job board this came from.")
    title: str = Field(..., min_length=1)
    company: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1, description="City name, region, or 'Remote'.")
    description: str = Field(..., description="Plain text description with HTML stripped.")
    url: str = Field(..., min_length=1, description="Direct apply link.")

    salary_min: float | None = None
    salary_max: float | None = None
    salary_currency: str | None = None

    posted_at: datetime | None = None

    raw: dict[str, Any] = Field(
        default_factory=dict,
        repr=False,
        description="Original API response, kept for debugging.",
    )
