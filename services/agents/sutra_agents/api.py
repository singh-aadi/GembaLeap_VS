"""HTTP surface called by the web app's server functions (service-to-service on Cloud Run)."""

from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from . import channels, levels, payments, rules, scoring
from .agents import specialists
from .config import ModelNotConfiguredError, settings
from .escalation import choose_tier
from .runtime import AgentOutputError, run_json
from .schemas import AskAnswer, EightD, Event, ShiftBrief

app = FastAPI(title="SutraOS agents", version="0.1.0")


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


class LevelRequest(BaseModel):
    stageLevels: dict[str, int]
    criticalStages: list[str]
    streakDays: int = Field(ge=0)
    adherence: float = Field(ge=0, le=1)
    buyerVerified: bool


class LevelOut(BaseModel):
    level: int
    next: int
    gaps: list[str]


@app.post("/rules/level", response_model=LevelOut)
def level(body: LevelRequest) -> LevelOut:
    """Sutra level and what blocks the next one. Pure code, no model."""
    current = levels.plant_level(body.stageLevels, body.criticalStages)
    nxt = min(5, current + 1)
    gaps = levels.promotion_gaps(
        nxt, levels.Streak(body.streakDays, body.adherence, body.buyerVerified)
    )
    return LevelOut(level=current, next=nxt, gaps=gaps)


class InvoiceIn(BaseModel):
    issuedAt: str
    paidAt: str | None = None
    now: str
    termDays: int = 45
    poQty: float
    poPrice: float
    grnQty: float
    invoiceQty: float
    invoicePrice: float


class InvoiceOut(BaseModel):
    day: int
    limit: int
    status: str
    matched: bool
    issues: list[str]


@app.post("/rules/invoice", response_model=InvoiceOut)
def invoice(body: InvoiceIn) -> InvoiceOut:
    """Payment clock against the 45-day MSMED limit plus PO/GRN/invoice three-way match."""
    day, limit, status = payments.payment_clock(body.issuedAt, body.paidAt, body.now, body.termDays)
    issues = payments.invoice_match(
        body.poQty, body.poPrice, body.grnQty, body.invoiceQty, body.invoicePrice
    )
    return InvoiceOut(day=day, limit=limit, status=status, matched=not issues, issues=issues)


class Tiered(BaseModel):
    tier: str


@app.get("/rules/tier", response_model=Tiered)
def tier(base: str, confidence: float = 1.0, input_chars: int = 0) -> Tiered:
    if base not in ("flash_lite", "flash", "pro", "none"):
        raise HTTPException(status_code=422, detail="unknown tier")
    return Tiered(tier=choose_tier(base, confidence, input_chars))  # type: ignore[arg-type]


class GaugeReading(BaseModel):
    value: float | None
    unit: str
    confidence: float
    reason: str


@app.post("/agents/gauge/read", response_model=GaugeReading)
async def gauge_read(body: AgentRequest) -> GaugeReading:
    return await _run(specialists.gauge_reader, body, GaugeReading)


@app.post("/agents/baseline/draft", response_model=dict[str, Any])
async def baseline_draft(body: AgentRequest) -> dict[str, Any]:
    return (await _run(specialists.baseline, body, _Loose)).model_dump()


@app.post("/agents/planner/check-plan", response_model=dict[str, Any])
async def check_plan(body: AgentRequest) -> dict[str, Any]:
    return (await _run(specialists.planner, body, _Loose)).model_dump()


class _Loose(BaseModel):
    model_config = {"extra": "allow"}


@app.get("/channels/whatsapp", response_class=PlainTextResponse)
def whatsapp_verify(
    mode: str = Query(alias="hub.mode"),
    token: str = Query(alias="hub.verify_token"),
    challenge: str = Query(alias="hub.challenge"),
) -> str:
    expected = settings().whatsapp_verify_token
    if mode != "subscribe" or not expected or token != expected:
        raise HTTPException(status_code=403, detail="verification failed")
    return challenge


@app.post("/channels/whatsapp")
async def whatsapp_inbound(request: Request) -> dict[str, Any]:
    """Accepts WhatsApp messages and routes each one. Replies are sent once a provider is wired."""
    messages = channels.parse(await request.json())
    return {"routed": [{"sender": m.sender, "route": channels.route(m)} for m in messages]}
