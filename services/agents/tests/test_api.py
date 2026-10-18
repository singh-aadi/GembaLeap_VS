from fastapi.testclient import TestClient

from gembaleap_agents.api import app

client = TestClient(app)


def test_healthz():
    assert client.get("/healthz").json() == {"status": "ok"}


def test_rank_is_deterministic():
    body = {
        "candidates": [
            {
                "id": "die",
                "factor": "operations",
                "lossMinutes30d": 310,
                "recurrence": 8,
                "effort": 4,
            },
            {
                "id": "pitch",
                "factor": "equipment_failure",
                "lossMinutes30d": 212,
                "recurrence": 6,
                "effort": 2,
            },
        ]
    }
    ranked = client.post("/agents/bottleneck/rank", json=body).json()
    assert [r["id"] for r in ranked] == ["pitch", "die"]


def test_passport_with_seeded_heat_error_fails():
    body = {
        "template": "valve",
        "certificateHeat": "H24-0917",
        "lineHeat": "H24-0971",
        "chemistry": {"C": 0.22, "Mn": 0.84},
        "chemistryLimits": {"C": 0.30, "Mn": 1.00},
        "hydro": {"pressureBar": 24, "durationS": 120},
        "dimensionsReported": ["bore", "face"],
        "dimensionsCritical": ["bore", "face"],
    }
    result = client.post("/agents/passport/check", json=body).json()
    assert result["overall"] == "fail"
    assert [c["result"] for c in result["checks"]] == ["fail", "pass", "pass", "pass"]


def test_cycle_closes_only_on_new_evidence():
    body = {
        "baseline": 6,
        "result": 1,
        "fixAppliedAt": "2026-10-09T07:00:00Z",
        "evidenceCapturedAt": ["2026-10-01T00:00:00Z"],
    }
    assert client.post("/agents/quality/verify", json=body).json()["canClose"] is False


def test_model_endpoints_report_missing_configuration(monkeypatch):
    monkeypatch.delenv("GEMINI_FLASH_MODEL", raising=False)
    response = client.post("/agents/capture", json={"tenantId": "t1", "payload": {}})
    assert response.status_code == 503
