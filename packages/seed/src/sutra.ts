import type {
  AuditPack,
  Baseline,
  CheckRecord,
  ChecklistItem,
  Invoice,
  PlantProfile,
  PlantSkill,
  ProcessMap,
  RewardRule,
  Scheme,
  Skill,
} from '@sutraos/schemas'
import { IST } from './clock'
import type { SeedContext } from './context'
import { id } from './ids'
import { S, ST, T, U } from './tenants'

/** The micro-AI skill library. Tier is the starting model; code escalates only when needed. */
export const skills: Skill[] = [
  {
    key: 'gauge_reader',
    leak: 'in_process',
    tier: 'flash_lite',
    metric: 'Readings within tolerance',
    target: 98,
    unit: 'percent',
    unlocks: 1,
  },
  {
    key: 'sheet_digitiser',
    leak: 'in_process',
    tier: 'flash',
    metric: 'Field accuracy',
    target: 95,
    unit: 'percent',
    unlocks: 1,
  },
  {
    key: 'voice_to_event',
    leak: 'problems',
    tier: 'flash',
    metric: 'Code accuracy',
    target: 85,
    unit: 'percent',
    unlocks: 1,
  },
  {
    key: 'check_plan',
    leak: 'first_off',
    tier: 'pro',
    metric: 'Rows accepted by coach',
    target: 80,
    unit: 'percent',
    unlocks: 2,
  },
  {
    key: 'mtc_checker',
    leak: 'material_receipt',
    tier: 'flash',
    metric: 'Seeded errors caught',
    target: 100,
    unit: 'percent',
    unlocks: 2,
  },
  {
    key: 'report_drafter',
    leak: 'final_inspection',
    tier: 'flash',
    metric: 'Claims cited',
    target: 100,
    unit: 'percent',
    unlocks: 2,
  },
  {
    key: 'shift_brief',
    leak: 'handover',
    tier: 'flash_lite',
    metric: 'Briefs acknowledged',
    target: 90,
    unit: 'percent',
    unlocks: 2,
  },
  {
    key: 'drift_explainer',
    leak: 'in_process',
    tier: 'flash_lite',
    metric: 'Alert to action',
    target: 4,
    unit: 'hours',
    unlocks: 3,
  },
  {
    key: 'capa_drafter',
    tier: 'pro',
    metric: 'Rubric score',
    target: 80,
    unit: 'percent',
    unlocks: 3,
  },
  {
    key: 'audit_mapper',
    tier: 'flash',
    metric: 'Invented evidence',
    target: 0,
    unit: 'count',
    unlocks: 3,
  },
  {
    key: 'invoice_matcher',
    leak: 'invoice',
    tier: 'flash_lite',
    metric: 'Match precision',
    target: 97,
    unit: 'percent',
    unlocks: 3,
  },
  {
    key: 'ask_evidence',
    tier: 'flash',
    metric: 'Valid citations',
    target: 100,
    unit: 'percent',
    unlocks: 3,
  },
  {
    key: 'scheme_finder',
    tier: 'none',
    metric: 'Reasons shown',
    target: 100,
    unit: 'percent',
    unlocks: 0,
  },
]

export const schemes: Scheme[] = [
  {
    id: 'zed-handholding',
    name: 'MSE Sustainable ZED: handholding and technology support',
    body: 'Ministry of MSME',
    benefit:
      'Up to ₹2 lakh for consultancy and ₹3 lakh for technology upgradation after certification',
    requires: { maxTurnoverCrore: 250, zedAtLeast: 'bronze' },
    url: 'https://zed.msme.gov.in',
    verifiedOn: '2026-11-01',
  },
  {
    id: 'zed-women',
    name: 'ZED certification fee support for women-owned MSMEs',
    body: 'Ministry of MSME',
    benefit: '100% subsidy on certification cost',
    requires: { womenOwned: true },
    url: 'https://zed.msme.gov.in',
    verifiedOn: '2026-11-01',
  },
  {
    id: 'treds',
    name: 'TReDS invoice discounting',
    body: 'RBI-licensed TReDS platforms',
    benefit: 'Early payment on accepted invoices from large buyers and CPSEs',
    requires: { maxTurnoverCrore: 500 },
    url: 'https://www.rbi.org.in',
    verifiedOn: '2026-11-01',
  },
]

export function buildSutra(ctx: SeedContext) {
  const { clock } = ctx
  const ist = (day: number, hhmm: string) => clock.local(day, hhmm, IST)
  const ev = (
    key: string,
    kind: 'photo' | 'audio' | 'scan' | 'file',
    caption: string,
    day = -10,
    by: string = U.amol,
  ) => ctx.ev(`sutra:${key}`, { kind, siteId: S.shinde, by, at: ist(day, '11:00'), caption })

  const profiles: PlantProfile[] = [
    {
      siteId: S.shinde,
      tenantId: T.shinde,
      udyamNo: 'UDYAM-MH-26-0048213',
      employees: 45,
      turnoverCrore: 18,
      sector: 'machining',
      cluster: 'Pune–Chakan',
      tier: 't1_lite',
      coachId: U.amol,
      zed: 'bronze',
      isoCertified: false,
      womenOwned: false,
    },
    {
      siteId: S.shakti,
      tenantId: T.shakti,
      udyamNo: 'UDYAM-TN-03-0119876',
      employees: 110,
      turnoverCrore: 64,
      sector: 'castings',
      cluster: 'Coimbatore',
      tier: 't2_core',
      coachId: U.amol,
      zed: 'silver',
      isoCertified: true,
      womenOwned: false,
    },
    {
      siteId: S.sato,
      tenantId: T.sato,
      udyamNo: 'n/a (Japan)',
      employees: 45,
      turnoverCrore: 40,
      sector: 'stamping',
      cluster: 'Aichi',
      tier: 't2_core',
      coachId: U.amol,
      zed: 'none',
      isoCertified: true,
      womenOwned: true,
    },
  ]

  const walk = [
    ev('walk-receipt', 'photo', 'MTC file in receipt cupboard, unchecked'),
    ev('walk-cnc', 'photo', 'Paper check sheet at CNC-3, filled at shift end'),
    ev('walk-voice', 'audio', 'Sunita explains first-off approval (Marathi, 40 s)'),
    ev('walk-weld', 'photo', 'Weld fixture without setting card'),
    ev('walk-records', 'file', 'Two weeks of rejection register (Excel)'),
  ]

  const baselines: Baseline[] = [
    {
      id: id('baseline:shinde'),
      siteId: S.shinde,
      coachId: U.amol,
      startedAt: ist(-12, '09:30'),
      status: 'reviewed',
      questionsAnswered: 25,
      walkMedia: 38,
      recordDays: 14,
      dimensions: [
        {
          dimension: 'standard_work',
          level: 1,
          rationale: 'Work instructions exist for CNC but not for welding.',
          evidenceIds: [walk[3] ?? ''],
          nextGap: 'Setting card at each weld fixture, photographed',
        },
        {
          dimension: 'inspection_evidence',
          level: 1,
          rationale: 'Checks recorded, but on paper at shift end.',
          evidenceIds: [walk[1] ?? ''],
          nextGap: 'In-process checks captured with a photo when taken',
        },
        {
          dimension: 'problem_solving',
          level: 1,
          rationale: 'Rejections logged with a cause, but no action or follow-up.',
          evidenceIds: [walk[4] ?? ''],
          nextGap: 'One CAPA closed with before/after evidence',
        },
        {
          dimension: 'delivery_flow',
          level: 2,
          rationale: 'Dispatch plan followed; on-time delivery 92% in the register.',
          evidenceIds: [walk[4] ?? ''],
          nextGap: 'Daily output vs plan recorded for 30 days',
        },
        {
          dimension: 'data_connectivity',
          level: 1,
          rationale: 'Tally for invoices; photos on WhatsApp.',
          evidenceIds: [walk[2] ?? ''],
          nextGap: 'Material certificates linked to lots',
        },
      ],
      secondAssessorLevel: 1,
      reviewedAt: ist(-11, '17:00'),
    },
  ]

  const step = (
    sid: string,
    name: string,
    owner: string,
    checks: string[],
    leak?: ProcessMap['steps'][number]['leak'],
  ) => ({ id: sid, name, owner, checks, leak })
  const processMaps: ProcessMap[] = [
    {
      id: id('map:shinde:current'),
      siteId: S.shinde,
      state: 'current',
      status: 'coach_edited',
      updatedAt: ist(-11, '12:00'),
      steps: [
        step('s1', 'Material receipt', 'Stores', ['Count bars'], {
          kind: 'material_receipt',
          description: 'MTC filed, never checked against the grade',
        }),
        step('s2', 'Set-up and first-off', 'Sunita Jadhav', ['First piece judged by eye'], {
          kind: 'first_off',
          description: 'No control plan; first-off not recorded',
        }),
        step('s3', 'CNC turning', 'Ravi Patil', ['OD and length, written at shift end'], {
          kind: 'in_process',
          description: 'Readings written from memory',
        }),
        step('s4', 'Problems on the line', 'Ravi Patil', [], {
          kind: 'problems',
          description: 'Told verbally, then lost',
        }),
        step('s5', 'Shift handover', 'Sunita Jadhav', [], {
          kind: 'handover',
          description: 'Know-how leaves with people',
        }),
        step('s6', 'Final inspection', 'Quality inspector', ['Visual, sample 5 pcs'], {
          kind: 'final_inspection',
          description: 'Buyer re-inspects 100%',
        }),
        step('s7', 'Invoice', 'Accounts', ['Tally invoice'], {
          kind: 'invoice',
          description: 'Disputes; 73-day cash cycle',
        }),
      ],
    },
    {
      id: id('map:shinde:future'),
      siteId: S.shinde,
      state: 'future',
      status: 'approved',
      updatedAt: ist(-10, '16:00'),
      approvedBy: U.suresh,
      steps: [
        step(
          's1',
          'Material receipt',
          'Stores',
          ['MTC photo, grade checked in code', 'Heat no. linked to lot'],
          { kind: 'material_receipt', description: 'MTC checker', skill: 'mtc_checker' },
        ),
        step(
          's2',
          'Set-up and first-off',
          'Sunita Jadhav',
          ['First-off photo + readings vs plan'],
          {
            kind: 'first_off',
            description: 'Control plan drafted from drawing',
            skill: 'check_plan',
          },
        ),
        step('s3', 'CNC turning', 'Ravi Patil', ['Gauge photo every 2 h, limits in code'], {
          kind: 'in_process',
          description: 'Gauge reader',
          skill: 'gauge_reader',
        }),
        step(
          's4',
          'Problems on the line',
          'Ravi Patil',
          ['Voice note in Marathi, one-tap confirm'],
          { kind: 'problems', description: 'Voice to event', skill: 'voice_to_event' },
        ),
        step('s5', 'Shift handover', 'Sunita Jadhav', ['Five-line brief, acknowledged'], {
          kind: 'handover',
          description: 'Shift brief',
          skill: 'shift_brief',
        }),
        step('s6', 'Final inspection', 'Quality inspector', ['Daily report, every claim cited'], {
          kind: 'final_inspection',
          description: 'Report drafter',
          skill: 'report_drafter',
        }),
        step(
          's7',
          'Invoice',
          'Accounts',
          ['PO, GRN and invoice matched', 'Payment clock vs 45 days'],
          { kind: 'invoice', description: 'Invoice matcher', skill: 'invoice_matcher' },
        ),
      ],
    },
  ]

  const enabled = (
    siteId: string,
    keys: Array<[Skill['key'], number | undefined, number]>,
    day: number,
  ): PlantSkill[] =>
    keys.map(([skill, measured, runs30d]) => ({
      siteId,
      skill,
      enabled: true,
      enabledAt: ist(day, '10:00'),
      measured,
      runs30d,
    }))

  const plantSkills: PlantSkill[] = [
    ...enabled(
      S.shinde,
      [
        ['gauge_reader', 98.6, 412],
        ['voice_to_event', 87, 64],
        ['mtc_checker', 100, 22],
        ['shift_brief', 93, 18],
        ['invoice_matcher', 98, 31],
      ],
      -9,
    ),
    ...enabled(
      S.sato,
      [
        ['gauge_reader', 99.1, 620],
        ['voice_to_event', 88, 92],
        ['report_drafter', 100, 30],
        ['shift_brief', 95, 30],
        ['capa_drafter', 84, 2],
        ['ask_evidence', 100, 14],
      ],
      -60,
    ),
    ...enabled(
      S.shakti,
      [
        ['mtc_checker', 100, 48],
        ['report_drafter', 100, 30],
        ['gauge_reader', 98.2, 300],
      ],
      -45,
    ),
  ]

  const auditPacks: AuditPack[] = [
    {
      id: id('audit-pack:shinde:zed'),
      siteId: S.shinde,
      standard: 'zed',
      builtAt: ist(0, '09:00'),
      clauses: [
        {
          ref: 'ZED-B1',
          title: 'Daily production and quality records',
          evidenceIds: [walk[1] ?? ''],
        },
        {
          ref: 'ZED-B2',
          title: 'Measurement instruments identified and calibrated',
          evidenceIds: [],
          gap: 'No calibration certificates uploaded for 3 micrometers',
        },
        {
          ref: 'ZED-B3',
          title: 'Material traceability from receipt to dispatch',
          evidenceIds: [walk[0] ?? ''],
        },
        {
          ref: 'ZED-S1',
          title: 'Problem solving with root cause and action',
          evidenceIds: [],
          gap: 'No closed CAPA yet; first cycle due in 3 weeks',
        },
        {
          ref: 'ZED-S2',
          title: 'Safety: guards and PPE at machines',
          evidenceIds: [walk[3] ?? ''],
        },
      ],
    },
  ]

  const rewardRules: RewardRule[] = [
    {
      buyerTenantId: T.kestrel,
      level: 2,
      reward: 'payment_terms',
      detail: 'Invoices paid in 30 days instead of 45',
    },
    {
      buyerTenantId: T.kestrel,
      level: 3,
      reward: 'reduced_inspection',
      detail: 'Skip-lot inspection: 1 lot in 5',
    },
    {
      buyerTenantId: T.kestrel,
      level: 4,
      reward: 'new_parts_rfq',
      detail: 'Invited to quote for new programme parts',
    },
  ]

  const items: ChecklistItem[] = [
    {
      id: id('check:shinde:od'),
      siteId: S.shinde,
      stageId: ST.cncShinde,
      label: {
        en: 'Shaft OD 24.98–25.00 mm (gauge photo)',
        mr: 'शाफ्ट OD 24.98–25.00 mm (गेज फोटो)',
        hi: 'शाफ्ट OD 24.98–25.00 mm (गेज फोटो)',
      },
      standardRef: 'CP-KF-SH-118 rev A',
      requirement: { kind: 'measurement', unit: 'mm', min: 24.98, max: 25, decimals: 3 },
      slots: ['07:00', '09:00', '11:00', '13:00'],
      critical: true,
    },
    {
      id: id('check:shinde:mtc'),
      siteId: S.shinde,
      stageId: ST.receipt,
      label: {
        en: 'Bar heat number matches MTC',
        mr: 'बारचा हीट नंबर MTC शी जुळतो',
        hi: 'बार का हीट नंबर MTC से मेल खाता है',
      },
      standardRef: 'WI-ST-02 rev A',
      requirement: { kind: 'scan', field: 'heat_no' },
      slots: ['08:00'],
      critical: true,
    },
    {
      id: id('check:shinde:weld'),
      siteId: S.shinde,
      stageId: ST.welding,
      label: {
        en: 'Weld setting card followed (photo)',
        mr: 'वेल्ड सेटिंग कार्ड पाळले (फोटो)',
        hi: 'वेल्ड सेटिंग कार्ड का पालन (फोटो)',
      },
      standardRef: 'WI-WD-01 rev A',
      requirement: { kind: 'photo' },
      slots: ['08:30', '12:30'],
      critical: false,
    },
  ]

  const record = (
    key: string,
    itemId: string,
    stageId: string,
    slot: string,
    at: string,
    value?: number,
    text?: string,
  ): CheckRecord => ({
    id: id(`record:shinde:${key}`),
    itemId,
    siteId: S.shinde,
    stageId,
    shiftDate: clock.date,
    shift: 'A',
    slot,
    result: 'pass',
    value,
    text,
    evidenceIds: [
      ctx.ev(`shinde-check:${key}`, {
        kind: 'photo',
        siteId: S.shinde,
        by: U.ravi,
        at: ist(0, at),
        caption:
          value !== undefined
            ? `Micrometer photo, ${value} mm`
            : `Photo, ${text ?? 'setting card'}`,
      }),
    ],
    recordedBy: U.ravi,
    recordedAt: ist(0, at),
  })
  const records: CheckRecord[] = [
    record('od-7', id('check:shinde:od'), ST.cncShinde, '07:00', '07:04', 24.992),
    record('mtc-8', id('check:shinde:mtc'), ST.receipt, '08:00', '08:06', undefined, 'H26-4471'),
  ]

  const invoices: Invoice[] = [
    {
      id: id('inv:shinde:1'),
      supplierTenantId: T.shinde,
      buyerTenantId: T.kestrel,
      number: 'SPF/26-27/0412',
      amount: 486_000,
      currency: 'INR',
      issuedAt: ist(-73, '10:00'),
      termDays: 45,
    },
    {
      id: id('inv:shinde:2'),
      supplierTenantId: T.shinde,
      buyerTenantId: T.kestrel,
      number: 'SPF/26-27/0455',
      amount: 512_400,
      currency: 'INR',
      issuedAt: ist(-38, '10:00'),
      termDays: 45,
    },
    {
      id: id('inv:shinde:3'),
      supplierTenantId: T.shinde,
      buyerTenantId: T.kestrel,
      number: 'SPF/26-27/0390',
      amount: 401_800,
      currency: 'INR',
      issuedAt: ist(-95, '10:00'),
      termDays: 45,
      paidAt: ist(-55, '10:00'),
    },
  ]

  return {
    profiles,
    baselines,
    processMaps,
    skills,
    plantSkills,
    auditPacks,
    rewardRules,
    schemes,
    items,
    records,
    invoices,
  }
}
