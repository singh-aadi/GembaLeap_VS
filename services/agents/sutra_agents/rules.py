"""Passport rules. Values come from documents via the passport agent; comparisons happen here."""

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Literal

Result = Literal["pass", "warn", "fail"]


@dataclass(frozen=True)
class RuleOutcome:
    rule: str
    result: Result
    detail: str


def heat_match(certificate_heat: str | None, line_heat: str | None) -> RuleOutcome:
    def norm(h: str) -> str:
        return "".join(h.split()).upper()

    if not certificate_heat or not line_heat:
        return RuleOutcome(
            "heat_match", "fail", "Heat number missing on certificate or line record."
        )
    ok = norm(certificate_heat) == norm(line_heat)
    verb = "matches" if ok else "does not match"
    detail = f"Certificate heat {certificate_heat} {verb} line capture {line_heat}."
    return RuleOutcome("heat_match", "pass" if ok else "fail", detail)


def chemistry_in_grade(values: Mapping[str, float], limits: Mapping[str, float]) -> RuleOutcome:
    """`limits` holds maximum percentages per element from the ITP grade table."""
    missing = [el for el in limits if el not in values]
    over = [el for el, limit in limits.items() if el in values and values[el] > limit]
    if missing:
        return RuleOutcome("chemistry_in_grade", "fail", f"Not reported: {', '.join(missing)}.")
    if over:
        parts = ", ".join(f"{el} {values[el]} > {limits[el]}" for el in over)
        return RuleOutcome("chemistry_in_grade", "fail", f"Above grade limit: {parts}.")
    return RuleOutcome("chemistry_in_grade", "pass", "All reported elements within grade.")


def hydro_test(
    pressure_bar: float | None, duration_s: float | None, itp_bar: float, itp_s: float
) -> RuleOutcome:
    if pressure_bar is None or duration_s is None:
        return RuleOutcome("hydro_test", "fail", "No hydro test record.")
    ok = pressure_bar >= itp_bar and duration_s >= itp_s
    detail = f"Shell {pressure_bar} bar for {duration_s} s against ITP {itp_bar} bar for {itp_s} s."
    return RuleOutcome("hydro_test", "pass" if ok else "fail", detail)


def dimensions_complete(reported: Sequence[str], critical: Sequence[str]) -> RuleOutcome:
    missing = sorted(set(critical) - set(reported))
    if missing:
        return RuleOutcome("dimensions_complete", "fail", f"Missing: {', '.join(missing)}.")
    return RuleOutcome(
        "dimensions_complete", "pass", f"{len(critical)} of {len(critical)} critical dimensions."
    )


def overall(outcomes: Sequence[RuleOutcome]) -> Result:
    results = {o.result for o in outcomes}
    return "fail" if "fail" in results else "warn" if "warn" in results else "pass"
