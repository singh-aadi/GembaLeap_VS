"""Eval runner. Calls the agent service and checks results against thresholds.json.

    uv run --project ../services/agents python run.py [eval ...]

Evals whose golden set is not in golden/ yet are reported as skipped, not passed.
Results go to stdout as JSON lines; the BigQuery writer (evals.results) is added in M6.
"""

import json
import os
import random
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
BASE_URL = os.environ.get("AGENTS_BASE_URL", "http://localhost:8080")
THRESHOLDS = json.loads((ROOT / "thresholds.json").read_text())


def post(path: str, body: dict) -> dict:
    request = urllib.request.Request(
        BASE_URL + path, json.dumps(body).encode(), {"content-type": "application/json"}
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read())


def passport_recall() -> dict:
    """40 synthetic valve lots, 12 with one seeded certificate error each."""
    rng = random.Random(7)
    limits = {"C": 0.30, "Mn": 1.00, "Si": 0.60}
    flagged = false_warnings = 0
    for i in range(40):
        heat = f"H24-{1000 + i}"
        case = {
            "template": "valve",
            "certificateHeat": heat,
            "lineHeat": heat,
            "chemistry": {"C": 0.22, "Mn": 0.84, "Si": 0.41},
            "chemistryLimits": limits,
            "hydro": {"pressureBar": 24, "durationS": 120},
            "dimensionsReported": ["bore", "face", "flange"],
            "dimensionsCritical": ["bore", "face", "flange"],
        }
        seeded = i < 12
        if seeded:
            error = i % 4
            if error == 0:
                case["certificateHeat"] = heat[:-1] + str((int(heat[-1]) + 1) % 10)
            elif error == 1:
                case["chemistry"]["C"] = round(0.31 + rng.random() * 0.05, 2)
            elif error == 2:
                case["hydro"] = {"pressureBar": 24, "durationS": 45}
            else:
                case["dimensionsReported"] = ["bore", "face"]
        overall = post("/agents/passport/check", case)["overall"]
        flagged += seeded and overall != "pass"
        false_warnings += (not seeded) and overall != "pass"
    return {"errors_flagged": flagged / 12, "false_warning_rate": false_warnings / 28}


RUNNERS = {"passport_recall": passport_recall}


def main(selected: list[str]) -> int:
    failed = False
    for name, spec in THRESHOLDS.items():
        if selected and name not in selected:
            continue
        golden = spec["set"]
        if golden != "generated" and not (ROOT / golden).exists():
            print(json.dumps({"eval": name, "status": "skipped", "reason": f"{golden} not present"}))
            continue
        runner = RUNNERS.get(name)
        if not runner:
            print(json.dumps({"eval": name, "status": "skipped", "reason": "runner not implemented"}))
            continue
        result = runner()
        value = result[spec["metric"]]
        ok = value >= spec.get("min", float("-inf")) and value <= spec.get("max", float("inf"))
        if "max_false_warning_rate" in spec:
            ok = ok and result["false_warning_rate"] <= spec["max_false_warning_rate"]
        failed |= not ok
        print(json.dumps({"eval": name, "status": "pass" if ok else "fail", **result}))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
