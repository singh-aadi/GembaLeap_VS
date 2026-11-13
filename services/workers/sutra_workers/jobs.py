"""Cloud Run job entry points. Each job is idempotent and keyed by the record it processes.

Contracts are fixed here; bodies land with the milestone named in each docstring.
"""

from collections.abc import Callable


def media() -> None:
    """M1. On Pub/Sub `evidence.uploaded`: recompute SHA-256 server-side, write derivatives,
    and blur faces and name badges in the copy used for buyer sharing."""
    raise NotImplementedError


def shift_brief() -> None:
    """M1. Cloud Scheduler at each shift end: POST /agents/shift-brief for every active site."""
    raise NotImplementedError


def daily_report() -> None:
    """M1. Cloud Scheduler 06:30 plant time: compute the day's metrics, then POST
    /agents/report/draft. The draft waits for a person to approve; nothing is sent."""
    raise NotImplementedError


def nightly_rank() -> None:
    """M3. Aggregate 30-day losses per code and stage, POST /agents/bottleneck/rank."""
    raise NotImplementedError


def audit_anchor() -> None:
    """M5. Sign the last audit-chain hash of the day with Cloud KMS and store the anchor."""
    raise NotImplementedError


def bq_export() -> None:
    """M6. Export Firestore collections and eval results to BigQuery for benchmarks."""
    raise NotImplementedError


JOBS: dict[str, Callable[[], None]] = {
    "media": media,
    "shift-brief": shift_brief,
    "daily-report": daily_report,
    "nightly-rank": nightly_rank,
    "audit-anchor": audit_anchor,
    "bq-export": bq_export,
}
