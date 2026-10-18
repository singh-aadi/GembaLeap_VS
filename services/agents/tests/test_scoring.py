import pytest

from gembaleap_agents.scoring import Candidate, priority, rank, site_index, stage_level


def test_ranking_matches_typescript_fixture(fixture):
    rows = fixture("bottleneck-ranking.json")
    candidates = [
        Candidate(r["id"], r["factor"], r["lossMinutes30d"], r["recurrence"], r["effort"])
        for r in rows
    ]
    ranked = {r.id: r for r in rank(candidates)}
    for row in rows:
        assert ranked[row["id"]].priority == pytest.approx(row["priority"])
        assert ranked[row["id"]].rank == row["rank"]


def test_priority_formula():
    c = Candidate("pitch", "equipment_failure", 212, 6, 2)
    assert priority(c) == pytest.approx(212 * 0.832 * 7 / 2)


def test_effort_out_of_range_is_rejected():
    with pytest.raises(ValueError):
        priority(Candidate("x", "operations", 10, 0, 0))


def test_stage_level_is_the_weakest_evidenced_dimension():
    levels = {"capture": 2, "traceability": 1, "decision_use": 3}
    evidence = {"capture": ["e1"], "traceability": ["e2"], "decision_use": ["e3"]}
    assert stage_level(levels, evidence) == 1


def test_dimension_without_evidence_counts_as_zero():
    assert stage_level({"capture": 3, "traceability": 3}, {"capture": ["e1"]}) == 0


def test_site_index_weights_lossy_stages_more():
    levels = {"press": 1, "weld": 3}
    assert site_index(levels, {"press": 300, "weld": 0}) < site_index(
        levels, {"press": 0, "weld": 300}
    )
