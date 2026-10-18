"""Canonical JSON and hashing. Byte-identical to packages/schemas/src/seal.ts."""

import hashlib
import json
from typing import Any

GENESIS_HASH = "0" * 64


def _normalise(value: Any) -> Any:
    # JavaScript prints 2.0 as 2; match it so both sides hash the same bytes.
    if isinstance(value, float) and value.is_integer():
        return int(value)
    if isinstance(value, dict):
        return {k: _normalise(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalise(v) for v in value]
    return value


def canonical_json(value: Any) -> str:
    return json.dumps(_normalise(value), sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def chain_hash(prev_hash: str, entry: dict[str, Any]) -> str:
    """hash = sha256(prevHash + canonicalJSON(entry))"""
    return sha256_hex(prev_hash + canonical_json(entry))
