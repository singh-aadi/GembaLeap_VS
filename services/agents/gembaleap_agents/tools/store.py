"""Data access for agent tools. Every read is scoped to one tenant.

`SeedStore` reads the synthetic seed (packages/seed `pnpm export`) so the agents
can run locally against Gemini without Firestore. The Firestore implementation
replaces it in M0 with the same method signatures.
"""

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Protocol

from ..config import settings


class Store(Protocol):
    def stages(self, tenant_id: str) -> list[dict[str, Any]]: ...
    def events(self, tenant_id: str) -> list[dict[str, Any]]: ...
    def evidence(self, tenant_id: str, evidence_id: str) -> dict[str, Any] | None: ...
    def lot(self, tenant_id: str, lot_id: str) -> dict[str, Any] | None: ...
    def ncr(self, tenant_id: str, ncr_id: str) -> dict[str, Any] | None: ...
    def check_records(self, tenant_id: str) -> list[dict[str, Any]]: ...


class SeedStore:
    def __init__(self, path: Path) -> None:
        self._data = json.loads(path.read_text(encoding="utf-8"))
        self._site_tenant = {s["id"]: s["tenantId"] for s in self._data["sites"]}

    def _owned(self, rows: list[dict[str, Any]], tenant_id: str) -> list[dict[str, Any]]:
        return [r for r in rows if self._site_tenant.get(r.get("siteId", "")) == tenant_id]

    def stages(self, tenant_id: str) -> list[dict[str, Any]]:
        return self._owned(self._data["stages"], tenant_id)

    def events(self, tenant_id: str) -> list[dict[str, Any]]:
        return [e for e in self._data["events"] if e["tenantId"] == tenant_id]

    def evidence(self, tenant_id: str, evidence_id: str) -> dict[str, Any] | None:
        found = next((e for e in self._data["evidence"] if e["id"] == evidence_id), None)
        return found if found and found["tenantId"] == tenant_id else None

    def lot(self, tenant_id: str, lot_id: str) -> dict[str, Any] | None:
        found = next((lot for lot in self._data["lots"] if lot["id"] == lot_id), None)
        return found if found and found["tenantId"] == tenant_id else None

    def ncr(self, tenant_id: str, ncr_id: str) -> dict[str, Any] | None:
        found = next((n for n in self._data["ncrs"] if n["id"] == ncr_id), None)
        if found and tenant_id in (found["supplierTenantId"], found["buyerTenantId"]):
            return found
        return None

    def check_records(self, tenant_id: str) -> list[dict[str, Any]]:
        return self._owned(self._data["checkRecords"], tenant_id)


@lru_cache(maxsize=1)
def store() -> Store:
    path = settings().seed_path
    if not path:
        raise RuntimeError("SEED_PATH is not set and the Firestore store is not wired yet")
    return SeedStore(Path(path))
