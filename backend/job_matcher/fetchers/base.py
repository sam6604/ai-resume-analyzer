"""Abstract base for all job-board fetchers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import ClassVar

from ..models import Job


class BaseFetcher(ABC):
    """Contract every job-board fetcher must implement.

    Subclasses are expected to be cheap to instantiate (no network in
    ``__init__``) and to perform all I/O in :meth:`fetch`, which must
    be async so multiple fetchers can be fanned out in parallel from
    Stage 2 onwards.
    """

    source_name: ClassVar[str] = ""

    @abstractmethod
    async def fetch(self, skill: str, location: str, limit: int = 20) -> list[Job]:
        """Search the underlying job board and return normalized :class:`Job` objects.

        Args:
            skill: Free-text keyword, e.g. ``"python developer"``.
            location: City or region, e.g. ``"pune"`` or ``"remote"``.
            limit: Maximum number of jobs to return.

        Returns:
            A list of normalized jobs. **Implementations must return an
            empty list rather than raising for transport/auth/rate-limit
            errors** — the caller decides how to react to a degraded source.
        """
        raise NotImplementedError
