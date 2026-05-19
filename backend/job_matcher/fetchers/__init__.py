"""Fetcher implementations, one per job board."""

from .adzuna import AdzunaFetcher
from .base import BaseFetcher

__all__ = ["BaseFetcher", "AdzunaFetcher"]
