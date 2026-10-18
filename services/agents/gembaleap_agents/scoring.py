"""Deterministic scoring. Models classify and extract; these functions decide."""

from collections.abc import Mapping, Sequence
from dataclasses import dataclass

# Factor loadings from Ongbali et al. (2021).
FACTOR_LOADING: dict[str, float] = {
    "equipment_failure": 0.832,
    "material_flow": 0.834,
    "material_unavailability": 0.811,
    "communication": 0.802,
    "operations": 0.780,
    "market_demand": 0.739,
}


@dataclass(frozen=True)
class Candidate:
    id: str
    factor: str
    loss_minutes_30d: float
    recurrence: int
    effort: int


@dataclass(frozen=True)
class Ranked:
    id: str
    priority: float
    rank: int


def priority(c: Candidate) -> float:
    """priority = loss × |λ_factor| × (1 + recurrence) / effort"""
    if not 1 <= c.effort <= 5:
        raise ValueError("effort must be 1-5")
    return c.loss_minutes_30d * abs(FACTOR_LOADING[c.factor]) * (1 + c.recurrence) / c.effort


def rank(candidates: Sequence[Candidate]) -> list[Ranked]:
    scored = sorted(
        ((round(priority(c), 1), c.id) for c in candidates), key=lambda p: (-p[0], p[1])
    )
    return [Ranked(id=cid, priority=p, rank=i + 1) for i, (p, cid) in enumerate(scored)]


def stage_level(levels: Mapping[str, int], evidence: Mapping[str, Sequence[str]]) -> int:
    """Highest level every dimension meets; a dimension without evidence counts as L0."""
    if not levels:
        return 0
    return min(level if evidence.get(dim) else 0 for dim, level in levels.items())


def site_index(stage_levels: Mapping[str, int], stage_losses: Mapping[str, float]) -> float:
    """Σ w_s · L_s / Σ w_s with w_s = 1 + loss_s / Σ loss. Stages that lose more weigh more."""
    total_loss = sum(stage_losses.values())
    weights = {
        s: 1 + (stage_losses.get(s, 0) / total_loss if total_loss else 0) for s in stage_levels
    }
    return round(
        sum(weights[s] * lvl for s, lvl in stage_levels.items()) / sum(weights.values()), 2
    )
