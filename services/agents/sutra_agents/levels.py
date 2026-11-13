"""Sutra level rules. Mirrors packages/schemas/src/rules.ts."""

from collections.abc import Mapping, Sequence
from dataclasses import dataclass

STREAK_DAYS = {2: 30, 3: 90, 4: 90, 5: 90}


def plant_level(stage_levels: Mapping[str, int], critical_stages: Sequence[str]) -> int:
    """plant_level = min over critical stages of stage_level. No critical stages means L0."""
    if not critical_stages:
        return 0
    return min(stage_levels.get(s, 0) for s in critical_stages)


@dataclass(frozen=True)
class Streak:
    days: int
    adherence: float
    buyer_verified: bool


def promotion_gaps(target: int, streak: Streak) -> list[str]:
    """What promotion to `target` still needs. L2 needs 30 days; L3+ 90 days, 95% and a buyer check."""
    gaps: list[str] = []
    if target >= 2 and streak.days < (90 if target >= 3 else 30):
        gaps.append("streak_days")
    if target >= 3 and streak.adherence < 0.95:
        gaps.append("adherence")
    if target >= 3 and not streak.buyer_verified:
        gaps.append("buyer_verification")
    return gaps
