# Generated from packages/schemas by scripts/generate-schemas.sh. Do not edit.

from __future__ import annotations

from typing import Any, Literal
from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    PositiveFloat,
    RootModel,
    confloat,
    conint,
    constr,
)
from ulid import ULID
from enum import StrEnum
from datetime import date


class Model(RootModel[Any]):
    root: Any


class EvidenceId(RootModel[ULID]):
    root: ULID


class AnswerAssessmentInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    assessmentId: ULID
    answer: constr(min_length=1, max_length=2000)
    evidenceIds: list[EvidenceId] = Field(..., max_length=5)


class Source(StrEnum):
    agent = "agent"
    local_index = "local_index"


class AskInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    question: constr(min_length=3, max_length=500)
    supplierTenantId: ULID | None = None


class Status(StrEnum):
    in_progress = "in_progress"
    scored = "scored"


class Role(StrEnum):
    auditor = "auditor"
    owner = "owner"


class TranscriptItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    role: Role
    text: str
    evidenceIds: list[ULID]
    at: AwareDatetime


class Assessment(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    siteId: ULID
    startedAt: AwareDatetime
    status: Status
    maxQuestions: Literal[25]
    transcript: list[TranscriptItem]


class AuditAction(StrEnum):
    event_confirm = "event.confirm"
    check_record = "check.record"
    report_publish = "report.publish"
    score_review = "score.review"
    consent_grant = "consent.grant"
    consent_revoke = "consent.revoke"
    passport_seal = "passport.seal"
    eightd_approve = "eightd.approve"
    cycle_open = "cycle.open"
    cycle_close = "cycle.close"
    buyer_view = "buyer.view"


class AuditEntry(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    seq: conint(ge=1, le=9007199254740991)
    tenantId: ULID
    actorId: ULID
    action: AuditAction
    objectRef: str
    at: AwareDatetime
    prevHash: constr(pattern=r"^[a-f0-9]{64}$")
    hash: constr(pattern=r"^[a-f0-9]{64}$")


class BottleneckFactor(StrEnum):
    equipment_failure = "equipment_failure"
    material_flow = "material_flow"
    material_unavailability = "material_unavailability"
    communication = "communication"
    operations = "operations"
    market_demand = "market_demand"


class ById(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID


class CheckRequirement1(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    kind: Literal["measurement"]
    unit: str
    min: float
    max: float
    decimals: conint(ge=0, le=4)


class CheckRequirement2(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    kind: Literal["photo"]


class FieldModel(StrEnum):
    heat_no = "heat_no"
    coil_no = "coil_no"
    gauge_id = "gauge_id"


class CheckRequirement3(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    kind: Literal["scan"]
    field: FieldModel


class CheckRequirement4(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    kind: Literal["confirm"]


class CheckRequirement(
    RootModel[CheckRequirement1 | CheckRequirement2 | CheckRequirement3 | CheckRequirement4]
):
    root: CheckRequirement1 | CheckRequirement2 | CheckRequirement3 | CheckRequirement4


class CheckResult(StrEnum):
    pass_ = "pass"
    out_of_limit = "out_of_limit"
    fail = "fail"


class Slot(RootModel[constr(pattern=r"^\d{2}:\d{2}$")]):
    root: constr(pattern=r"^\d{2}:\d{2}$")


class Claim(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: str
    text: constr(max_length=300)
    evidenceIds: list[EvidenceId] = Field(..., min_length=1)


class EvidenceItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    storagePath: str
    sha256: constr(pattern=r"^[a-f0-9]{64}$")


class CloseCycleInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    cycleId: ULID
    resultValue: confloat(ge=0.0)
    evidence: list[EvidenceItem] = Field(..., min_length=1)


class Code(RootModel[constr(pattern=r"^[A-Z]{1,3}-[A-Z0-9-]+$")]):
    root: constr(pattern=r"^[A-Z]{1,3}-[A-Z0-9-]+$")


class ConfirmEventInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    eventId: ULID
    codes: list[Code] | None = Field(None, max_length=5, min_length=1)
    stageId: ULID | None = None


class ConsentScope(StrEnum):
    maturity = "maturity"
    cycles = "cycles"
    passports = "passports"
    reports = "reports"


class Kind(StrEnum):
    photo = "photo"
    audio = "audio"
    scan = "scan"


class MediaItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    kind: Kind
    storagePath: str
    sha256: constr(pattern=r"^[a-f0-9]{64}$")


class Dimension(StrEnum):
    capture = "capture"
    standardisation = "standardisation"
    traceability = "traceability"
    decision_use = "decision_use"
    people_cadence = "people_cadence"


class Drift(StrEnum):
    improving = "improving"
    stable = "stable"
    drifting = "drifting"


class Citation(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    field: str
    evidenceId: ULID


class EightD(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    d1Team: str
    d2Problem: str
    d3Containment: str
    d4RootCause: str
    d5Corrective: str
    d6Implement: str
    d7Prevent: str
    d8Closure: str
    citations: list[Citation] = Field(..., min_length=1)
    similarCases: list[str]


class Status1(StrEnum):
    draft = "draft"
    confirmed = "confirmed"


class Sort(StrEnum):
    time = "time"
    severity = "severity"


class EventType(StrEnum):
    defect = "defect"
    downtime = "downtime"
    material = "material"
    safety = "safety"
    idea = "idea"


class EvidenceKind(StrEnum):
    photo = "photo"
    audio = "audio"
    scan = "scan"
    file = "file"


class Certification(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    name: str
    validTo: date
    evidenceId: ULID


class EvidenceProfile(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    tenantId: ULID
    ladder: conint(ge=0, le=5)
    evidenceDays: conint(ge=-9007199254740991, le=9007199254740991)
    checklistAdherence90d: confloat(ge=0.0, le=1.0)
    firstTimeRight: confloat(ge=0.0, le=1.0)
    capacityNote: str
    certifications: list[Certification]
    listedAt: AwareDatetime


class Evidence(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    storagePath: str
    sha256: constr(pattern=r"^[a-f0-9]{64}$")


class FixHeatInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    lotId: ULID
    certificateHeatNo: constr(pattern=r"^[A-Z0-9-]{4,20}$")
    evidence: Evidence


class GrantConsentInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    buyerTenantId: ULID
    scope: list[ConsentScope] = Field(..., min_length=1)
    expiresAt: date


class Sort1(StrEnum):
    risk = "risk"
    ladder = "ladder"
    adherence = "adherence"
    name = "name"


class View(StrEnum):
    table = "table"
    grid = "grid"


class PlanItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: str
    text: str
    owner: str
    dueAt: AwareDatetime
    done: bool


class Status3(StrEnum):
    open = "open"
    verifying = "verifying"
    closed = "closed"


class Baseline(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    metric: str
    value: float
    unit: str


class Result(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    value: float


class ImprovementCycle(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    siteId: ULID
    bottleneckId: ULID
    stageId: ULID
    title: str
    fromLevel: conint(ge=0, le=5)
    targetLevel: conint(ge=0, le=5)
    plan: list[PlanItem]
    openedAt: AwareDatetime
    dueAt: AwareDatetime
    fixAppliedAt: AwareDatetime | None = None
    status: Status3
    baseline: Baseline
    result: Result | None = None
    beforeEvidenceIds: list[ULID]
    verificationEvidenceIds: list[ULID]
    closedAt: AwareDatetime | None = None


class InspectionTier(StrEnum):
    tightened = "tightened"
    normal = "normal"
    reduced = "reduced"


class Currency(StrEnum):
    JPY = "JPY"
    INR = "INR"


class Invoice(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    supplierTenantId: ULID
    buyerTenantId: ULID
    number: str
    amount: float
    currency: Currency
    issuedAt: AwareDatetime
    termDays: conint(ge=-9007199254740991, le=9007199254740991)
    paidAt: AwareDatetime | None = None


class Locale(StrEnum):
    en = "en"
    ja = "ja"
    vi = "vi"
    hi = "hi"
    ta = "ta"
    id = "id"


class LocalizedText(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    en: constr(min_length=1)
    ja: constr(min_length=1) | None = None
    vi: constr(min_length=1) | None = None
    hi: constr(min_length=1) | None = None
    ta: constr(min_length=1) | None = None
    id: constr(min_length=1) | None = None


class Template(StrEnum):
    valve = "valve"
    stamping = "stamping"


class Lot(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    tenantId: ULID
    siteId: ULID
    buyerTenantId: ULID
    lotNo: str
    poNumber: str
    partNo: str
    partName: str
    heatNo: str | None = None
    qty: conint(le=9007199254740991, gt=0)
    template: Template
    producedAt: AwareDatetime
    shippedAt: AwareDatetime | None = None
    deliveredOnTime: bool | None = None


class ThreadItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: str
    authorId: ULID
    text: constr(max_length=1000)
    evidenceIds: list[ULID]
    at: AwareDatetime


class NcrMessageInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    ncrId: ULID
    text: constr(min_length=1, max_length=1000)


class NcrStatus(StrEnum):
    open = "open"
    eight_d_draft = "eight_d_draft"
    eight_d_submitted = "eight_d_submitted"
    accepted = "accepted"
    closed = "closed"


class Status4(StrEnum):
    building = "building"
    needs_fix = "needs_fix"
    ready = "ready"
    sealed = "sealed"


class Overall(StrEnum):
    pass_ = "pass"
    warn = "warn"
    fail = "fail"


class Result1(StrEnum):
    pass_ = "pass"
    warn = "warn"
    fail = "fail"


class PassportRule(StrEnum):
    heat_match = "heat_match"
    chemistry_in_grade = "chemistry_in_grade"
    hydro_test = "hydro_test"
    dimensions_complete = "dimensions_complete"
    hash_unchanged = "hash_unchanged"


class Period(StrEnum):
    daily = "daily"
    weekly = "weekly"


class Status5(StrEnum):
    draft = "draft"
    published = "published"


class Metrics(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    checksDone: conint(ge=-9007199254740991, le=9007199254740991)
    checksDue: conint(ge=-9007199254740991, le=9007199254740991)
    outOfLimit: conint(ge=-9007199254740991, le=9007199254740991)
    contained: conint(ge=-9007199254740991, le=9007199254740991)
    eventsConfirmed: conint(ge=-9007199254740991, le=9007199254740991)
    lossMinutes: float
    lotsShipped: conint(ge=-9007199254740991, le=9007199254740991)
    lotsFirstTimeRight: conint(ge=-9007199254740991, le=9007199254740991)
    openNcrs: conint(ge=-9007199254740991, le=9007199254740991)
    cyclesClosed: conint(ge=-9007199254740991, le=9007199254740991)


class StageRow(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    stageId: ULID
    checksDone: conint(ge=-9007199254740991, le=9007199254740991)
    checksDue: conint(ge=-9007199254740991, le=9007199254740991)
    outOfLimit: conint(ge=-9007199254740991, le=9007199254740991)


class QualityReport(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    tenantId: ULID
    siteId: ULID
    period: Period
    periodStart: date
    periodEnd: date
    status: Status5
    metrics: Metrics
    stageRows: list[StageRow]
    highlights: list[Claim]
    risks: list[Claim]
    actions: list[Claim]
    evidenceCount: conint(ge=-9007199254740991, le=9007199254740991)
    preparedAt: AwareDatetime
    approvedBy: ULID | None = None
    approvedAt: AwareDatetime | None = None
    sealHash: constr(pattern=r"^[a-f0-9]{64}$") | None = None
    auditSeq: conint(ge=-9007199254740991, le=9007199254740991) | None = None


class RaiseNcrInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    lotId: ULID
    title: constr(min_length=5, max_length=120)
    description: constr(min_length=10, max_length=1000)


class Kind1(StrEnum):
    photo = "photo"
    scan = "scan"


class EvidenceItem2(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    kind: Kind1
    storagePath: str
    sha256: constr(pattern=r"^[a-f0-9]{64}$")


class RecordCheckInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    itemId: ULID
    slot: str
    value: float | None = None
    text: constr(max_length=80) | None = None
    passed: bool | None = None
    containment: constr(max_length=400) | None = None
    evidence: list[EvidenceItem2] = Field(..., min_length=1)


class State(StrEnum):
    accepted = "accepted"
    disputed = "disputed"


class ReviewScoreInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    assessmentId: ULID
    stageId: ULID
    dimension: Dimension
    state: State
    comment: constr(max_length=400) | None = None


class Role1(StrEnum):
    supplier_owner = "supplier_owner"
    line_lead = "line_lead"
    supplier_quality = "supplier_quality"
    buyer_quality = "buyer_quality"
    buyer_procurement = "buyer_procurement"


class ScoreKey(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    assessmentId: ULID
    stageId: ULID
    dimension: Dimension


class ScoreState(StrEnum):
    draft = "draft"
    accepted = "accepted"
    disputed = "disputed"


class Sector(StrEnum):
    industrial_equipment = "industrial_equipment"
    stamping = "stamping"
    castings = "castings"
    machining = "machining"
    forging = "forging"
    surface = "surface"
    seals = "seals"
    springs = "springs"


class Shift(StrEnum):
    A = "A"
    B = "B"
    C = "C"


class ParetoItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    label: str
    minutes: confloat(ge=0.0)


class Checks(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    done: conint(ge=-9007199254740991, le=9007199254740991)
    due: conint(ge=-9007199254740991, le=9007199254740991)
    outOfLimit: conint(ge=-9007199254740991, le=9007199254740991)


class ShiftBrief(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    siteId: ULID
    shift: Shift
    shiftStart: AwareDatetime
    shiftEnd: AwareDatetime
    generatedAt: AwareDatetime
    happened: list[Claim]
    watch: list[Claim]
    pareto: list[ParetoItem]
    checks: Checks
    acknowledgedBy: ULID | None = None
    acknowledgedAt: AwareDatetime | None = None


class Site(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    tenantId: ULID
    name: str
    timeZone: str
    ladderLevel: conint(ge=0, le=5)
    siteIndex: confloat(ge=0.0, le=5.0)


class SlotStatus(StrEnum):
    done = "done"
    out_of_limit = "out_of_limit"
    due = "due"
    overdue = "overdue"
    upcoming = "upcoming"


class SourcingFilters(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    process: str | None = None
    minLadder: conint(ge=0, le=5) | None = None


class Stage(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    siteId: ULID
    name: LocalizedText
    order: conint(ge=-9007199254740991, le=9007199254740991)
    weight: PositiveFloat


class StageScore(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    assessmentId: ULID
    stageId: ULID
    dimension: Dimension
    level: conint(ge=0, le=5)
    rationale: constr(max_length=300)
    evidenceIds: list[EvidenceId] = Field(..., min_length=1)
    state: ScoreState
    comment: str | None = None


class SupplierScorecard(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    tenantId: ULID
    ladder: conint(ge=0, le=5)
    siteIndex: float
    trend: list[float] = Field(..., max_length=12, min_length=12)
    dimensions: dict[Dimension, conint(ge=0, le=5)]
    checklistAdherence30d: confloat(ge=0.0, le=1.0)
    firstTimeRight: confloat(ge=0.0, le=1.0)
    ftrStreak: conint(ge=-9007199254740991, le=9007199254740991)
    openNcrs: conint(ge=-9007199254740991, le=9007199254740991)
    eightDMedianDays: float
    otif: confloat(ge=0.0, le=1.0)
    lastReportAt: AwareDatetime | None = None
    drift: Drift
    inspectionTier: InspectionTier
    suggestedTier: InspectionTier | None = None
    paymentOnTime: confloat(ge=0.0, le=1.0)


class Country(StrEnum):
    JP = "JP"
    IN = "IN"
    VN = "VN"
    ID = "ID"
    MY = "MY"
    TH = "TH"


class TenantKind(StrEnum):
    buyer = "buyer"
    supplier = "supplier"


class Tier(StrEnum):
    tightened = "tightened"
    normal = "normal"
    reduced = "reduced"


class TierDecisionInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    supplierTenantId: ULID
    tier: Tier


class User(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    tenantId: ULID
    role: Role1
    name: str
    title: str
    locale: Locale
    languages: list[Locale] = Field(..., min_length=1)
    siteIds: list[ULID]


class AskAnswer(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: str
    question: str
    answer: str
    claims: list[Claim]
    searched: conint(ge=-9007199254740991, le=9007199254740991)
    source: Source


class Bottleneck(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    siteId: ULID
    stageId: ULID
    title: str
    codes: list[str]
    factor: BottleneckFactor
    lossMinutes30d: confloat(ge=0.0)
    recurrence: conint(ge=0, le=9007199254740991)
    effort: conint(ge=1, le=5)
    priority: float
    rank: conint(ge=1, le=9007199254740991)
    cycleId: ULID | None = None


class CheckRecord(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    itemId: ULID
    siteId: ULID
    stageId: ULID
    shiftDate: date
    shift: Shift
    slot: str
    result: CheckResult
    value: float | None = None
    text: constr(max_length=80) | None = None
    containment: constr(max_length=400) | None = None
    evidenceIds: list[EvidenceId] = Field(..., min_length=1)
    recordedBy: ULID
    recordedAt: AwareDatetime


class ChecklistItem(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    siteId: ULID
    stageId: ULID
    label: LocalizedText
    standardRef: str
    requirement: CheckRequirement
    slots: list[Slot] = Field(..., min_length=1)
    critical: bool


class Consent(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    supplierTenantId: ULID
    buyerTenantId: ULID
    scope: list[ConsentScope] = Field(..., min_length=1)
    expiresAt: AwareDatetime
    revokedAt: AwareDatetime | None = None
    createdBy: ULID
    createdAt: AwareDatetime


class CreateEventDraftInput(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    siteId: ULID
    stageId: ULID | None = None
    type: EventType | None = None
    locale: Locale
    text: constr(max_length=1000) | None = None
    lotNo: constr(max_length=40) | None = None
    media: list[MediaItem] = Field(..., max_length=6)


class Event(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    tenantId: ULID
    siteId: ULID
    stageId: ULID
    type: EventType
    codes: list[str] = Field(..., max_length=5)
    lotId: ULID | None = None
    severity: conint(ge=1, le=5)
    lossMinutes: confloat(ge=0.0) | None = None
    summaryEn: constr(max_length=400)
    summaryLocal: constr(max_length=400)
    summaryJa: constr(max_length=400) | None = None
    locale: Locale
    evidenceIds: list[ULID]
    status: Status1
    createdBy: ULID
    createdAt: AwareDatetime
    confirmedAt: AwareDatetime | None = None


class EventFilters(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    stage: ULID | None = None
    type: EventType | None = None
    status: Status1 | None = None
    sort: Sort


class EvidenceItem1(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    tenantId: ULID
    siteId: ULID
    kind: EvidenceKind
    storagePath: str
    sha256: constr(pattern=r"^[a-f0-9]{64}$")
    caption: constr(max_length=140) | None = None
    extracted: dict[str, Any] | None = None
    createdBy: ULID
    createdAt: AwareDatetime


class HeatmapFilters(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    sector: Sector | None = None
    drift: Drift | None = None
    sort: Sort1
    view: View


class Ncr(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    number: str
    buyerTenantId: ULID
    supplierTenantId: ULID
    lotId: ULID
    title: str
    description: str
    raisedBy: ULID
    raisedAt: AwareDatetime
    status: NcrStatus
    eightD: EightD | None = None
    eightDApprovedBy: ULID | None = None
    cycleId: ULID | None = None
    thread: list[ThreadItem]


class PassportCheck(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    rule: PassportRule
    result: Result1
    detail: str
    evidenceIds: list[ULID]
    explanation: str | None = None


class Tenant(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    id: ULID
    name: str
    kind: TenantKind
    country: Country
    city: str
    sector: Sector
    processes: list[str]
    locale: Locale
    openProfile: bool
    synthetic: Literal[True]


class Passport(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )
    lotId: ULID
    version: conint(ge=1, le=9007199254740991)
    status: Status4
    checks: list[PassportCheck]
    overall: Overall
    sealedHash: constr(pattern=r"^[a-f0-9]{64}$") | None = None
    sealedAt: AwareDatetime | None = None
    sealedBy: ULID | None = None
