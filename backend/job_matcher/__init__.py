"""Job matcher backend.

Fetches job postings from external job boards and normalizes them
into a single :class:`~job_matcher.models.Job` schema for downstream
ranking against a user's resume.

Stage 1 (current): single-source retrieval + normalization.
Stage 2 (planned): multi-source fan-out, deduplication, hybrid ranking.
"""
