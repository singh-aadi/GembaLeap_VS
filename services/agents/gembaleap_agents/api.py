"""HTTP surface called by the web app's server functions (service-to-service on Cloud Run)."""

from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from . import rules, scoring
from .agents import specialists
from .config import ModelNotConfiguredError
from .runtime import AgentOutputError, run_json
from .schemas import AskAnswer, EightD, Event, ShiftBrief

app = FastAPI(title="GembaLeap agents", version="0.1.0")


class TenantRequest(BaseModel):
    tenantId: str


class AgentRequest(TenantRequest):
    payload: dict[str, Any] = Field(default_factory=dict)


class CandidateIn(BaseModel):
    id: str
    factor: Literal[
        "equipment_failure",
        "material_flow",
        "material_unavailability",
        "communication",
        "operations",
        "market_demand",
    ]
    lossMinutes30d: float = Field(ge=0)
    recurrence: int = Field(ge=0)
    effort: int = Field(ge=1, le=5)


class RankRequest(BaseModel):
    candidates: list[CandidateIn]


class RankedOut(BaseModel):
    id: str
    priority: float
    rank: int


class PassportRequest(BaseModel):
    template: Literal["valve", "stamping"]
    certificateHeat: str | None
    lineHeat: str | None
    chemistry: dict[str, float] = Field(default_factory=dict)
    chemistryLimits: dict[str, float] = Field(default_factory=dict)
    hydro: dict[str, float] | None = None
    itpHydro: dict[str, float] = Field(default_factory=lambda: {"pressureBar": 24, "durationS": 60})
    dimensionsReported: list[str] = Field(default_factory=list)
    dimensionsCritical: list[str] = Field(default_factory=list)


class RuleOut(BaseModel):
    rule: str
    result: Literal["pass", "warn", "fail"]
    detail: str


class PassportOut(BaseModel):
    checks: list[RuleOut]
    overall: Literal["pass", "warn", "fail"]


class VerifyRequest(BaseModel):
    baseline: float = Field(ge=0)
    result: float = Field(ge=0)
    fixAppliedAt: str
    evidenceCapturedAt: list[str]


class VerifyOut(BaseModel):
    improved: bool
    newEvidence: bool
    canClose: bool


class MaturityTurn(BaseModel):
    question: str | None
    scores: list[dict[str, Any]] = Field(default_factory=list)


class ReportDraft(BaseModel):
    highlights: list[dict[str, Any]]
    risks: list[dict[str, Any]]
    actions: list[dict[str, Any]]


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/agents/bottleneck/rank", response_model=list[RankedOut])
def rank_bottlenecks(body: RankRequest) -> list[RankedOut]:
    """Deterministic ranking. Factor and effort come from the bottleneck agent, confirmed by the owner."""
    ranked = scoring.rank(
        [
            scoring.Candidate(c.id, c.factor, c.lossMinutes30d, c.recurrence, c.effort)
            for c in body.candidates
        ]
    )
    return [RankedOut(id=r.id, priority=r.priority, rank=r.rank) for r in ranked]


@app.post("/agents/passport/check", response_model=PassportOut)
def check_passport(body: PassportRequest) -> PassportOut:
    """Rule checks over values the passport agent extracted from documents."""
    outcomes = [rules.heat_match(body.certificateHeat, body.lineHeat)]
    if body.template == "valve":
        outcomes.append(rules.chemistry_in_grade(body.chemistry, body.chemistryLimits))
        outcomes.append(
            rules.hydro_test(
                (body.hydro or {}).get("pressureBar"),
                (body.hydro or {}).get("durationS"),
                body.itpHydro["pressureBar"],
                body.itpHydro["durationS"],
            )
        )
    outcomes.append(rules.dimensions_complete(body.dimensionsReported, body.dimensionsCritical))
    return PassportOut(
        checks=[RuleOut(rule=o.rule, result=o.result, detail=o.detail) for o in outcomes],
        overall=rules.overall(outcomes),
    )


@app.post("/agents/quality/verify", response_model=VerifyOut)
def verify_cycle(body: VerifyRequest) -> VerifyOut:
    """A cycle closes only when the result improved and evidence was captured after the fix."""
    new_evidence = any(at > body.fixAppliedAt for at in body.evidenceCapturedAt)
    improved = body.result < body.baseline
    return VerifyOut(
        improved=improved, newEvidence=new_evidence, canClose=improved and new_evidence
    )


async def _run(agent_factory, body: AgentRequest, output):
    try:
        return await run_json(agent_factory(), body.tenantId, body.payload, output)
    except ModelNotConfiguredError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except AgentOutputError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


@app.post("/agents/capture", response_model=Event)
async def capture(body: AgentRequest) -> Event:
    return await _run(specialists.capture, body, Event)


@app.post("/agents/shift-brief", response_model=ShiftBrief)
async def shift_brief(body: AgentRequest) -> ShiftBrief:
    return await _run(specialists.shift_brief, body, ShiftBrief)


@app.post("/agents/maturity/turn", response_model=MaturityTurn)
async def maturity_turn(body: AgentRequest) -> MaturityTurn:
    return await _run(specialists.maturity, body, MaturityTurn)


@app.post("/agents/quality/8d", response_model=EightD)
async def eight_d(body: AgentRequest) -> EightD:
    return await _run(specialists.quality, body, EightD)


@app.post("/agents/report/draft", response_model=ReportDraft)
async def report_draft(body: AgentRequest) -> ReportDraft:
    return await _run(specialists.report, body, ReportDraft)


@app.post("/agents/ask", response_model=AskAnswer)
async def ask(body: AgentRequest) -> AskAnswer:
    return await _run(specialists.ask, body, AskAnswer)
