from fastapi.testclient import TestClient

from sutra_agents import channels, levels, payments
from sutra_agents.api import app
from sutra_agents.escalation import choose_tier

client = TestClient(app)


def test_plant_level_is_weakest_critical_stage():
    assert levels.plant_level({"a": 2, "b": 1}, ["a", "b"]) == 1
    assert levels.plant_level({"a": 2}, []) == 0


def test_promotion_needs_verified_streak_for_l3():
    assert levels.promotion_gaps(3, levels.Streak(91, 0.96, True)) == []
    assert levels.promotion_gaps(3, levels.Streak(40, 0.9, False)) == [
        "streak_days",
        "adherence",
        "buyer_verification",
    ]


def test_payment_clock_flags_overdue():
    assert (
        payments.payment_clock("2026-08-01T00:00:00Z", None, "2026-10-13T00:00:00Z")[2] == "overdue"
    )
    assert payments.payment_clock(
        "2026-10-01T00:00:00Z", "2026-11-10T00:00:00Z", "2026-11-13T00:00:00Z"
    ) == (40, 45, "paid_on_time")


def test_invoice_three_way_match():
    assert payments.invoice_match(100, 50, 98, 100, 52) == ["qty_exceeds_grn", "price_mismatch"]


def test_escalation():
    assert choose_tier("flash_lite", 0.95) == "flash_lite"
    assert choose_tier("flash_lite", 0.6) == "flash"
    assert choose_tier("flash", 1.0, 20_000) == "pro"


def test_level_endpoint():
    body = {
        "stageLevels": {"cnc": 1, "weld": 2},
        "criticalStages": ["cnc", "weld"],
        "streakDays": 10,
        "adherence": 0.9,
        "buyerVerified": False,
    }
    assert client.post("/rules/level", json=body).json() == {
        "level": 1,
        "next": 2,
        "gaps": ["streak_days"],
    }


def test_whatsapp_routing():
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "messages": [
                                {"from": "9198", "type": "image", "image": {"id": "m1"}},
                                {"from": "9198", "type": "audio", "audio": {"id": "m2"}},
                                {
                                    "from": "9198",
                                    "type": "text",
                                    "text": {"body": "Was lot 31 OK?"},
                                },
                            ]
                        }
                    }
                ]
            }
        ]
    }
    routed = client.post("/channels/whatsapp", json=payload).json()["routed"]
    assert [r["route"] for r in routed] == ["gauge_reader", "voice_to_event", "ask"]
    assert channels.route(channels.Inbound(sender="x", kind="text", text="hi")) == "help"


def test_whatsapp_verify_rejects_without_token(monkeypatch):
    monkeypatch.delenv("WHATSAPP_VERIFY_TOKEN", raising=False)
    params = {"hub.mode": "subscribe", "hub.verify_token": "x", "hub.challenge": "c"}
    assert client.get("/channels/whatsapp", params=params).status_code == 403
