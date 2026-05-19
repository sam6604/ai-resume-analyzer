"""CLI entry point for the job_matcher backend.

Run with::

    python -m job_matcher.main search --skill "python developer" --location "pune" --limit 10
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Annotated

import typer
from rich.console import Console
from rich.syntax import Syntax

from .fetchers import AdzunaFetcher, BaseFetcher
from .models import Job

logger = logging.getLogger(__name__)

app = typer.Typer(
    add_completion=False,
    no_args_is_help=True,
    help="Job matcher CLI — fetch and normalize jobs from external boards.",
)
console = Console()

_FETCHERS: dict[str, type[BaseFetcher]] = {
    "adzuna": AdzunaFetcher,
    # Stage 2 will add: "jooble": JoobleFetcher, "remotive": RemotiveFetcher, "all": _FanOut
}


def _job_to_serializable(job: Job) -> dict:
    """Serialize a Job for CLI output, omitting the bulky ``raw`` payload."""
    return job.model_dump(exclude={"raw"}, mode="json")


async def _run_search(source: str, skill: str, location: str, limit: int) -> list[Job]:
    if source not in _FETCHERS:
        raise typer.BadParameter(
            f"Unknown source '{source}'. Available: {sorted(_FETCHERS)}"
        )
    fetcher = _FETCHERS[source]()
    return await fetcher.fetch(skill=skill, location=location, limit=limit)


@app.command()
def search(
    skill: Annotated[
        str,
        typer.Option(help="Skill or job title to search for, e.g. 'python developer'."),
    ],
    location: Annotated[
        str,
        typer.Option(help="Location string, e.g. 'pune', 'bangalore', 'remote'."),
    ],
    limit: Annotated[
        int,
        typer.Option(min=1, max=50, help="Maximum number of results to return."),
    ] = 10,
    source: Annotated[
        str,
        typer.Option(
            help="Which job board to query. Currently only 'adzuna'. "
            "Stage 2 will add 'jooble', 'remotive', 'all'."
        ),
    ] = "adzuna",
) -> None:
    """Search a job board and print normalized JSON results."""
    jobs = asyncio.run(_run_search(source, skill, location, limit))

    if not jobs:
        console.print(
            "[yellow]No jobs returned. Check stderr logs above for the underlying "
            "reason (auth, rate limit, empty search, etc.).[/yellow]"
        )
        raise typer.Exit(code=1)

    payload = [_job_to_serializable(j) for j in jobs]
    pretty = json.dumps(payload, indent=2, ensure_ascii=False, default=str)
    console.print(Syntax(pretty, "json", theme="monokai", word_wrap=True))


if __name__ == "__main__":
    app()
