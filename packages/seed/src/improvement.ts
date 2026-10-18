import {
  FACTOR_LOADING,
  type Assessment,
  type Bottleneck,
  type BottleneckFactor,
  type Dimension,
  type ImprovementCycle,
  type ShiftBrief,
  type StageScore,
} from '@gembaleap/schemas'
import { JST } from './clock'
import type { SeedContext } from './context'
import { EVENT_IDS } from './events'
import { id } from './ids'
import { S, ST, U } from './tenants'

/** Mirrors services/agents scoring.priority; parity is tested against fixtures/bottleneck-ranking.json. */
export function priority(b: {
  factor: BottleneckFactor
  lossMinutes30d: number
  recurrence: number
  effort: number
}) {
  return (b.lossMinutes30d * Math.abs(FACTOR_LOADING[b.factor]) * (1 + b.recurrence)) / b.effort
}

export const ASSESSMENT_ID = id('assessment:sato:2026q3')
export const REASSESSMENT_ID = id('assessment:sato:press2-recheck')
export const CYCLE_IDS = {
  pitch: id('cycle:sato:pitch'),
  handover: id('cycle:sato:handover'),
} as const

type Row = [
  stageId: string,
  levels: Record<Dimension, number>,
  rationale: Record<Dimension, string>,
]

export function buildImprovement(ctx: SeedContext) {
  const { clock } = ctx
  const jst = (day: number, hhmm: string) => clock.local(day, hhmm, JST)
  const ev = (
    key: string,
    caption: string,
    day: number,
    kind: 'photo' | 'scan' | 'file' = 'photo',
    by: string = U.haruka,
  ) => ctx.ev(`improvement:${key}`, { kind, siteId: S.sato, by, at: jst(day, '09:00'), caption })

  const paperTraveller = ev('traveller', 'Paper traveller for lot SPW-2409-112', -24)
  const checkSheet = ev('check-sheet', 'Press line 2 check sheet, September', -24, 'scan')
  const excelLog = ev('downtime-xlsx', 'Downtime log spreadsheet, Jul–Sep', -24, 'file')
  const lineChat = ev('line-chat', 'LINE group export, press team', -24, 'file')
  const cmmReport = ev('cmm', 'CMM report linked to lot SPW-2409-118', -24, 'scan')
  const passportExample = ev(
    'passport-example',
    'Sealed passport for lot SPW-2409-120',
    -24,
    'file',
  )
  const weldChart = ev('weld-chart', 'Weld current trend chart on cell PC', -24)

  const rows: Row[] = [
    [
      ST.blanking,
      { capture: 2, standardisation: 2, traceability: 2, decision_use: 1, people_cadence: 2 },
      {
        capture: 'Coil changes and width checks are recorded on the phone with photos.',
        standardisation: 'Width and coil checks use fixed codes from WI-BL-01/02.',
        traceability: 'Coil heat number is scanned at change and linked to the blank batch.',
        decision_use: 'Records are kept but not reviewed when planning coil orders.',
        people_cadence: 'Shift lead reviews the check list at handover.',
      },
    ],
    [
      ST.press2,
      { capture: 2, standardisation: 2, traceability: 1, decision_use: 1, people_cadence: 2 },
      {
        capture: 'Defects and downtime are captured by voice and photo in Vietnamese.',
        standardisation: 'Events carry standard defect and downtime codes.',
        traceability:
          'Press lots are not yet linked to the coil heat number; link is on the paper traveller.',
        decision_use:
          'Die change and pitch losses are logged but not used to schedule die maintenance.',
        people_cadence: 'Daily 10-minute stand-up uses the shift brief.',
      },
    ],
    [
      ST.weld,
      { capture: 2, standardisation: 2, traceability: 2, decision_use: 2, people_cadence: 2 },
      {
        capture: 'Peel tests are photographed with the reading.',
        standardisation: 'Peel test and tip dressing follow WI-SW-01/02 codes.',
        traceability: 'Weld batches are linked to press lots on the traveller scan.',
        decision_use: 'Tip dressing interval was changed from the peel history.',
        people_cadence: 'Weekly weld review with the quality lead.',
      },
    ],
    [
      ST.finalSato,
      { capture: 3, standardisation: 2, traceability: 3, decision_use: 2, people_cadence: 2 },
      {
        capture: 'CMM reports and packing photos are attached to every lot.',
        standardisation: 'Inspection uses the customer control plan codes.',
        traceability:
          'Lot, CMM report and certificate are linked in the lot passport and shared with the customer.',
        decision_use: 'First-time-right rate is reviewed monthly.',
        people_cadence: 'Inspector rota and training records are kept.',
      },
    ],
  ]

  const evidenceFor: Record<Dimension, string[]> = {
    capture: [EVENT_IDS.pitchD4, paperTraveller],
    standardisation: [checkSheet],
    traceability: [paperTraveller, cmmReport],
    decision_use: [excelLog],
    people_cadence: [lineChat],
  }

  const scores: StageScore[] = rows.flatMap(([stageId, levels, rationale]) =>
    (Object.keys(levels) as Dimension[]).map((dimension) => ({
      assessmentId: ASSESSMENT_ID,
      stageId,
      dimension,
      level: levels[dimension],
      rationale: rationale[dimension],
      evidenceIds:
        stageId === ST.finalSato && dimension === 'traceability'
          ? [cmmReport, passportExample]
          : stageId === ST.weld && dimension === 'decision_use'
            ? [weldChart]
            : evidenceFor[dimension],
      state:
        stageId === ST.press2 && dimension === 'decision_use'
          ? 'disputed'
          : stageId === ST.press2 || stageId === ST.blanking
            ? 'accepted'
            : 'draft',
      comment:
        stageId === ST.press2 && dimension === 'decision_use'
          ? 'We moved die D-114 maintenance forward after the pitch events in September. Attaching the maintenance plan.'
          : undefined,
    })),
  )

  const assessments: Assessment[] = [
    {
      id: ASSESSMENT_ID,
      siteId: S.sato,
      startedAt: jst(-24, '14:00'),
      status: 'scored',
      maxQuestions: 25,
      transcript: [],
    },
    {
      id: REASSESSMENT_ID,
      siteId: S.sato,
      startedAt: jst(-1, '16:00'),
      status: 'in_progress',
      maxQuestions: 25,
      transcript: [
        {
          role: 'auditor',
          text: 'This re-check covers Press line 2 only. When a coil is loaded on Press line 2, where is its heat number written down today?',
          evidenceIds: [],
          at: jst(-1, '16:00'),
        },
        {
          role: 'owner',
          text: 'Lan scans the coil tag in the blanking checklist. The press lot number is still on the paper traveller.',
          evidenceIds: [paperTraveller],
          at: jst(-1, '16:03'),
        },
        {
          role: 'auditor',
          text: 'Can you show one press lot from this week where the heat number and the lot number appear together in a digital record?',
          evidenceIds: [],
          at: jst(-1, '16:03'),
        },
        {
          role: 'owner',
          text: 'Lot SPW-2410-030 passport has both. It was sealed yesterday.',
          evidenceIds: [passportExample],
          at: jst(-1, '16:06'),
        },
        {
          role: 'auditor',
          text: 'Good. That supports traceability at L2 for that lot. Is the heat number added to every press lot, or only lots shipped to Kestrel?',
          evidenceIds: [],
          at: jst(-1, '16:06'),
        },
      ],
    },
  ]

  const candidates: Array<Omit<Bottleneck, 'priority' | 'rank'>> = [
    {
      id: id('bn:pitch'),
      siteId: S.sato,
      stageId: ST.press2,
      title: 'Hole pitch drifts out of tolerance',
      codes: ['D-PITCH-OOT'],
      factor: 'equipment_failure',
      lossMinutes30d: 212,
      recurrence: 6,
      effort: 2,
      cycleId: CYCLE_IDS.pitch,
    },
    {
      id: id('bn:die-change'),
      siteId: S.sato,
      stageId: ST.press2,
      title: 'Die change takes 38–45 min against a 25 min standard',
      codes: ['DT-DIE-CHANGE'],
      factor: 'operations',
      lossMinutes30d: 310,
      recurrence: 8,
      effort: 4,
    },
    {
      id: id('bn:coil-cert'),
      siteId: S.sato,
      stageId: ST.blanking,
      title: 'Coils arrive without mill certificates',
      codes: ['M-CERT-MISSING'],
      factor: 'material_unavailability',
      lossMinutes30d: 95,
      recurrence: 3,
      effort: 1,
    },
    {
      id: id('bn:coil-feed'),
      siteId: S.sato,
      stageId: ST.press2,
      title: 'Coil feed jams at the straightener',
      codes: ['DT-COIL-FEED'],
      factor: 'material_flow',
      lossMinutes30d: 64,
      recurrence: 5,
      effort: 3,
    },
    {
      id: id('bn:handover'),
      siteId: S.sato,
      stageId: ST.press2,
      title: 'Problems not passed on at shift handover',
      codes: ['C-HANDOVER'],
      factor: 'communication',
      lossMinutes30d: 30,
      recurrence: 4,
      effort: 2,
      cycleId: CYCLE_IDS.handover,
    },
    {
      id: id('bn:weld'),
      siteId: S.sato,
      stageId: ST.weld,
      title: 'Weld nugget undersize after long runs',
      codes: ['D-WELD-NUGGET'],
      factor: 'equipment_failure',
      lossMinutes30d: 41,
      recurrence: 2,
      effort: 2,
    },
  ]
  const bottlenecks: Bottleneck[] = candidates
    .map((c) => ({ ...c, priority: Math.round(priority(c) * 10) / 10, rank: 0 }))
    .sort((a, b) => b.priority - a.priority)
    .map((b, i) => ({ ...b, rank: i + 1 }))

  const cycles: ImprovementCycle[] = [
    {
      id: CYCLE_IDS.pitch,
      siteId: S.sato,
      bottleneckId: id('bn:pitch'),
      stageId: ST.press2,
      title: 'Stop hole-pitch drift on Press line 2',
      fromLevel: 1,
      targetLevel: 2,
      plan: [
        {
          id: 'p1',
          text: 'Replace worn pilot pins on die D-114',
          owner: 'Kenji Mori',
          dueAt: jst(-10, '17:00'),
          done: true,
        },
        {
          id: 'p2',
          text: 'Add 2-hourly hole-pitch check with photo to the daily checklist',
          owner: 'Kenji Mori',
          dueAt: jst(-9, '17:00'),
          done: true,
        },
        {
          id: 'p3',
          text: 'Record die stroke count at every die change',
          owner: 'Nguyen Thi Lan',
          dueAt: jst(2, '17:00'),
          done: false,
        },
        {
          id: 'p4',
          text: 'Hold 14 days with at most 1 out-of-tolerance reading',
          owner: 'Haruka Sato',
          dueAt: jst(6, '17:00'),
          done: false,
        },
      ],
      openedAt: jst(-14, '10:00'),
      dueAt: jst(6, '17:00'),
      fixAppliedAt: jst(-9, '16:00'),
      status: 'verifying',
      baseline: {
        metric: 'Out-of-tolerance pitch readings per 14 days',
        value: 6,
        unit: 'readings',
      },
      beforeEvidenceIds: [EVENT_IDS.pitchD4, ev('pilot-pin-worn', 'Worn pilot pin, D-114', -14)],
      verificationEvidenceIds: [
        ev('pilot-pin-new', 'New pilot pins fitted, D-114', -9, 'photo', U.kenji),
      ],
    },
    {
      id: CYCLE_IDS.handover,
      siteId: S.sato,
      bottleneckId: id('bn:handover'),
      stageId: ST.press2,
      title: 'Replace the paper handover note with the shift brief',
      fromLevel: 1,
      targetLevel: 2,
      plan: [
        {
          id: 'h1',
          text: 'Shift lead reads the generated brief at every handover',
          owner: 'Nguyen Thi Lan',
          dueAt: jst(-30, '17:00'),
          done: true,
        },
        {
          id: 'h2',
          text: 'Incoming lead confirms the brief in the app',
          owner: 'Nguyen Thi Lan',
          dueAt: jst(-28, '17:00'),
          done: true,
        },
      ],
      openedAt: jst(-45, '10:00'),
      dueAt: jst(-21, '17:00'),
      fixAppliedAt: jst(-30, '17:00'),
      status: 'closed',
      baseline: { metric: 'Repeat issues missed at handover per month', value: 5, unit: 'issues' },
      result: { value: 1 },
      beforeEvidenceIds: [lineChat],
      verificationEvidenceIds: [
        ev('handover-confirmations', '28 handover confirmations in 14 days', -22, 'file'),
      ],
      closedAt: jst(-21, '15:00'),
    },
  ]

  const briefs: ShiftBrief[] = [
    {
      id: id('brief:sato:today-a'),
      siteId: S.sato,
      shift: 'A',
      shiftStart: jst(0, '06:00'),
      shiftEnd: jst(0, '14:00'),
      generatedAt: jst(0, '11:15'),
      happened: [
        {
          id: 'b1',
          text: 'Hole pitch read 48.13 mm at 10:00; line stopped, die cleaned, 46 parts quarantined in red bin Q-07.',
          evidenceIds: [EVENT_IDS.pitchToday],
        },
        {
          id: 'b2',
          text: 'Peel test at 10:30 gave a 4.3 mm nugget; tips redressed and second peel passed at 5.1 mm.',
          evidenceIds: [EVENT_IDS.weldToday],
        },
        {
          id: 'b3',
          text: 'Coil feed jam at 08:40 cost 12 minutes.',
          evidenceIds: [id('event:coil-jam-today')],
        },
      ],
      watch: [
        {
          id: 'w1',
          text: 'Second pitch excursion in five days on die D-114. Check pilot pins at the 12:00 reading.',
          evidenceIds: [EVENT_IDS.pitchToday, EVENT_IDS.pitchD4],
        },
        {
          id: 'w2',
          text: 'Red bin Q-07 needs 100% check before the 13:00 packing.',
          evidenceIds: [EVENT_IDS.pitchToday],
        },
      ],
      pareto: [
        { label: 'Hole pitch out of tolerance', minutes: 17 },
        { label: 'Coil feed jam', minutes: 12 },
        { label: 'Weld nugget undersize', minutes: 9 },
      ],
      checks: { done: 14, due: 16, outOfLimit: 2 },
    },
  ]

  return { assessments, scores, bottlenecks, cycles, briefs }
}
