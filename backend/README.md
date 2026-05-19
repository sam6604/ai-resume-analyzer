# job_matcher backend

Stage 1 of the live-job-recommendation feature for the AI Resume Analyzer.

This module fetches job postings from external boards, normalizes them
into a single schema, and prints them as JSON. It is intentionally a
**pure Python module testable from the command line** — no FastAPI / Flask
yet. Future stages will add more fetchers, deduplication, and
embedding-based reranking against a user's resume.

## Stage roadmap

| Stage | Status | Scope |
|------:|:------:|:------|
| 1 | **done** | Adzuna fetcher + Job schema + normalizer + CLI |
| 2 | planned | Jooble + Remotive fetchers, parallel fan-out, dedup |
| 3 | planned | Embedding-based reranking against resume text + LLM re-ranker |
| 4 | planned | HTTP API + integration with the React frontend |

## Setup

```powershell
# 1. cd into this folder
cd backend

# 2. create a virtualenv (Python 3.11+ required)
python -m venv .venv
.\.venv\Scripts\Activate.ps1     # PowerShell
# .venv\Scripts\activate         # cmd.exe
# source .venv/bin/activate      # bash / WSL

# 3. install dependencies
pip install -r requirements.txt

# 4. configure secrets
copy .env.example .env           # PowerShell / cmd
# cp .env.example .env           # bash
# then edit .env and fill in your Adzuna keys.
```

Get free Adzuna API keys at [developer.adzuna.com](https://developer.adzuna.com).
The free tier allows ~250 calls/month, which is plenty for development.

## Usage

### CLI

```powershell
python -m job_matcher.main search --skill "python developer" --location "pune" --limit 10
```

### HTTP API (used by the React frontend)

```powershell
uvicorn job_matcher.api:app --reload --port 8000
```

Then from another terminal:

```powershell
curl "http://localhost:8000/api/jobs?skill=python+developer&location=pune&limit=5"
curl http://localhost:8000/api/health
```

OpenAPI docs are live at <http://localhost:8000/docs>. The React dev
server proxies ``/api/*`` to port 8000 via ``vite.config.ts``, so the
frontend can simply ``fetch("/api/jobs?...")``.

Other examples:

```powershell
python -m job_matcher.main search --skill "react frontend" --location "bangalore" --limit 5
python -m job_matcher.main search --skill "data scientist" --location "remote"
python -m job_matcher.main search --skill "ml engineer" --location "hyderabad" --source adzuna
```

Help:

```powershell
python -m job_matcher.main --help
python -m job_matcher.main search --help
```

## Expected output

JSON array of normalized jobs (the `raw` field is omitted from CLI
output for readability — it is still stored on the Job objects internally):

```json
[
  {
    "id": "adzuna_4983721548",
    "source": "adzuna",
    "title": "Python Developer",
    "company": "Acme Tech Pvt Ltd",
    "location": "Pune, Maharashtra",
    "description": "We are looking for a Python developer with experience in...",
    "url": "https://www.adzuna.in/land/ad/4983721548?...",
    "salary_min": 600000.0,
    "salary_max": 1200000.0,
    "salary_currency": "INR",
    "posted_at": "2026-05-12T08:42:00+00:00"
  },
  ...
]
```

Log lines (auth errors, rate limits, parse warnings) are written to
**stderr**, JSON output is written to **stdout**. This means you can
safely pipe the output:

```powershell
python -m job_matcher.main search --skill python --location pune > jobs.json
```

## Project layout

```
backend/
├── .env                        # local secrets — never committed
├── .env.example                # template
├── .gitignore
├── requirements.txt
├── README.md
└── job_matcher/
    ├── __init__.py
    ├── config.py               # pydantic-settings + logging setup
    ├── models.py               # Job pydantic model
    ├── normalizer.py           # raw API -> Job (one function per source)
    ├── main.py                 # typer CLI
    └── fetchers/
        ├── __init__.py
        ├── base.py             # BaseFetcher abstract class
        └── adzuna.py           # Adzuna implementation
```

## Design notes

- **Async-first.** Every fetcher is `async` even though we only have
  one today; Stage 2 fans out to multiple boards in parallel with
  `asyncio.gather`, and rewriting sync code later is more painful than
  using async from the start.
- **Fetchers never raise on transport errors.** Auth, rate-limit, and
  network failures are logged and return `[]`. A degraded source must
  not be able to crash the multi-source pipeline.
- **The `raw` field is preserved.** Every Job keeps its original API
  payload, so later stages can extract new fields without re-fetching.
- **No print() outside `main.py`.** Library code uses the `logging`
  module so it stays embeddable inside a future web service.

## Next: Stage 2

Adding more sources. Each is one new file in `fetchers/` plus one
`normalize_<source>` function. The CLI's `--source` flag and the
`_FETCHERS` registry in `main.py` then pick them up automatically.

Suggested order:

1. **Remotive fetcher** — `https://remotive.com/api/remote-jobs`, no auth, fully remote roles. Easiest to wire up next.
2. **Jooble fetcher** — POST `https://jooble.org/api/{key}`, single API key, very wide coverage including India.
3. **Fan-out** — a `--source all` mode that runs every fetcher concurrently with `asyncio.gather` and merges the results.
4. **Deduplication** — same job often appears on multiple boards. Hash on `(normalized_title, company, location)` and keep the highest-quality record.

Once Stage 2 lands, Stage 3 (embedding reranker) can score the merged
pool against the resume text extracted by the existing frontend pipeline.
