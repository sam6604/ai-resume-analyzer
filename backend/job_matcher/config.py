"""Application settings and logging configuration."""

from __future__ import annotations

import logging
import sys
from functools import lru_cache

from pydantic import Field, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated settings loaded from environment variables and ``.env``."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    adzuna_app_id: str = Field(..., min_length=1, description="Adzuna application id")
    adzuna_app_key: str = Field(..., min_length=1, description="Adzuna application key")

    gemini_api_key: str = Field(..., min_length=1, description="Google AI Studio API key")
    # gemini-2.5-flash-lite has a generous free tier and is the smallest /
    # cheapest current model in the 2.5 family. Override via GEMINI_MODEL
    # in .env if you have access to a larger model.
    # Other free-tier-friendly options if you hit a quota wall:
    #   gemini-2.0-flash-lite, gemini-flash-lite-latest, gemini-2.0-flash-lite-001
    gemini_model: str = Field("gemini-2.5-flash-lite", min_length=1, description="Gemini model id")

    http_timeout_seconds: float = Field(10.0, ge=1.0, le=60.0)
    adzuna_country: str = Field("in", min_length=2, max_length=2, description="ISO country code")


def _configure_logging() -> None:
    """Configure the root logger once at import time."""
    if logging.getLogger().handlers:
        return
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        stream=sys.stderr,
    )


_configure_logging()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return validated :class:`Settings`. Cached for the lifetime of the process.

    Raises a :class:`RuntimeError` with a friendly hint if required env vars
    are missing — the underlying :class:`pydantic.ValidationError` message
    can be confusing for a first-time setup.
    """
    try:
        return Settings()  # type: ignore[call-arg]
    except ValidationError as exc:
        raise RuntimeError(
            "Failed to load settings. Make sure backend/.env exists and contains "
            "ADZUNA_APP_ID, ADZUNA_APP_KEY, and GEMINI_API_KEY. Copy .env.example "
            "to .env and fill in keys from https://developer.adzuna.com and "
            "https://aistudio.google.com/app/apikey.\n"
            f"Underlying error: {exc}"
        ) from exc
