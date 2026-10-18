from gembaleap_agents import rules


def test_heat_mismatch_fails():
    outcome = rules.heat_match("H24-0917", "H24-0971")
    assert outcome.result == "fail"
    assert "does not match" in outcome.detail


def test_heat_match_ignores_case_and_spaces():
    assert rules.heat_match("h24-0971 ", "H24-0971").result == "pass"


def test_chemistry_above_limit_fails():
    outcome = rules.chemistry_in_grade({"C": 0.32, "Mn": 0.8}, {"C": 0.30, "Mn": 1.0})
    assert outcome.result == "fail"
    assert "C 0.32 > 0.3" in outcome.detail


def test_hydro_needs_pressure_and_duration():
    assert rules.hydro_test(24, 120, 24, 60).result == "pass"
    assert rules.hydro_test(24, 45, 24, 60).result == "fail"
    assert rules.hydro_test(None, None, 24, 60).result == "fail"


def test_overall_takes_the_worst():
    outcomes = [rules.heat_match("A1", "A1"), rules.dimensions_complete(["d1"], ["d1", "d2"])]
    assert rules.overall(outcomes) == "fail"
