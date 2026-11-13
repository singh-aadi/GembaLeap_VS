"""ADK tools. The tenant comes from session state set by the API, never from the model."""

from collections import Counter
from typing import Any

from google.adk.tools import ToolContext

from .store import store


def _tenant(tool_context: ToolContext) -> str:
    tenant_id = tool_context.state.get("tenant_id")
    if not tenant_id:
        raise PermissionError("tenant_id missing from session state")
    return str(tenant_id)


def get_stage_catalog(tool_context: ToolContext) -> list[dict[str, Any]]:
    """Lists the plant's process stages with their ids and names in each language."""
    return [{"id": s["id"], "name": s["name"]} for s in store().stages(_tenant(tool_context))]


def get_code_catalog(stage_id: str, tool_context: ToolContext) -> dict[str, int]:
    """Returns the defect, downtime and material codes used at a stage, with how often each was used."""
    counts = Counter(
        code
        for e in store().events(_tenant(tool_context))
        if e["stageId"] == stage_id
        for code in e["codes"]
    )
    return dict(counts.most_common(20))


def get_recent_events(stage_id: str, limit: int, tool_context: ToolContext) -> list[dict[str, Any]]:
    """Returns the latest confirmed events at a stage: type, codes, English summary and loss."""
    rows = [e for e in store().events(_tenant(tool_context)) if e["stageId"] == stage_id]
    rows.sort(key=lambda e: e["createdAt"], reverse=True)
    keys = ("id", "type", "codes", "summaryEn", "lossMinutes", "createdAt")
    return [{k: e.get(k) for k in keys} for e in rows[: max(1, min(limit, 20))]]


def search_events(query: str, tool_context: ToolContext) -> list[dict[str, Any]]:
    """Finds events whose English summary or codes contain every word of the query."""
    words = [w.lower() for w in query.split() if len(w) > 2]
    hits = [
        e
        for e in store().events(_tenant(tool_context))
        if all(w in (e["summaryEn"] + " " + " ".join(e["codes"])).lower() for w in words)
    ]
    return [{"id": e["id"], "summaryEn": e["summaryEn"], "codes": e["codes"]} for e in hits[:20]]


def get_evidence(evidence_id: str, tool_context: ToolContext) -> dict[str, Any] | None:
    """Returns one evidence item's kind, caption, capture time and extracted values."""
    item = store().evidence(_tenant(tool_context), evidence_id)
    if not item:
        return None
    keys = ("id", "kind", "caption", "createdAt", "extracted")
    return {k: item.get(k) for k in keys}


def get_lot(lot_id: str, tool_context: ToolContext) -> dict[str, Any] | None:
    """Returns a lot's PO, part, heat number and quantity."""
    return store().lot(_tenant(tool_context), lot_id)


def get_ncr(ncr_id: str, tool_context: ToolContext) -> dict[str, Any] | None:
    """Returns an NCR's description, lot and discussion thread."""
    return store().ncr(_tenant(tool_context), ncr_id)


def get_check_records(tool_context: ToolContext) -> list[dict[str, Any]]:
    """Returns checklist records: item, slot, reading, result and containment note."""
    return store().check_records(_tenant(tool_context))
