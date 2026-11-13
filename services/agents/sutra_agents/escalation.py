"""Model escalation. Start cheap; move up only when a rule in code says the task needs it."""

from typing import Literal

Tier = Literal["flash_lite", "flash", "pro", "none"]

CONFIDENCE_FLOOR = 0.8
LONG_INPUT_CHARS = 8_000


def choose_tier(base: Tier, confidence: float = 1.0, input_chars: int = 0) -> Tier:
    if base in ("none", "pro"):
        return base
    if confidence >= CONFIDENCE_FLOOR and input_chars <= LONG_INPUT_CHARS:
        return base
    return "flash" if base == "flash_lite" else "pro"
