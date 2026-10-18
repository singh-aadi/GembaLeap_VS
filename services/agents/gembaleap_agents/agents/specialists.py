"""The specialist agents. Each one drafts; people approve, code decides."""

from google.adk.agents import LlmAgent

from ..tools import catalog
from .base import specialist


def capture() -> LlmAgent:
    return specialist(
        "capture",
        "flash",
        "Structures a voice note, photo or text from the line into a draft event.",
        [catalog.get_stage_catalog, catalog.get_code_catalog, catalog.get_recent_events],
    )


def shift_brief() -> LlmAgent:
    return specialist(
        "shift_brief",
        "flash",
        "Writes the shift handover brief from the shift's events and checks.",
        [catalog.get_recent_events, catalog.get_check_records],
    )


def maturity() -> LlmAgent:
    return specialist(
        "maturity",
        "pro",
        "Interviews the owner and drafts ladder scores, each citing evidence.",
        [catalog.search_events, catalog.get_evidence],
    )


def bottleneck() -> LlmAgent:
    return specialist(
        "bottleneck",
        "flash",
        "Classifies losses by factor and estimates effort. Ranking is done in code.",
        [catalog.search_events],
    )


def quality() -> LlmAgent:
    return specialist(
        "quality",
        "pro",
        "Drafts an 8D with a citation for every field.",
        [catalog.get_ncr, catalog.search_events, catalog.get_check_records],
    )


def passport() -> LlmAgent:
    return specialist(
        "passport",
        "flash",
        "Extracts values from lot documents. Rule checks run in code.",
        [catalog.get_lot, catalog.get_evidence],
    )


def report() -> LlmAgent:
    return specialist(
        "report",
        "flash",
        "Drafts the daily or weekly built-in-quality report from the period's records.",
        [catalog.get_check_records, catalog.search_events],
    )


def ask() -> LlmAgent:
    return specialist(
        "ask",
        "flash",
        "Answers questions about the evidence a caller may see, with citations.",
        [catalog.search_events, catalog.get_evidence, catalog.get_check_records, catalog.get_lot],
    )
