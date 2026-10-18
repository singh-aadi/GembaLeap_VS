import type {
  Consent,
  EvidenceProfile,
  Invoice,
  Lot,
  Ncr,
  Passport,
  QualityReport,
  SupplierScorecard,
} from '@gembaleap/schemas'
import { IST, JST } from './clock'
import type { SeedContext } from './context'
import { EVENT_IDS } from './events'
import { id } from './ids'
import { CYCLE_IDS } from './improvement'
import { PROSPECT_SITES, S, ST, T, U } from './tenants'

const lotSpec = (
  lotNo: string,
  supplier: 'sato' | 'shakti',
  day: number,
  rest: Pick<Lot, 'poNumber' | 'partNo' | 'partName' | 'heatNo' | 'qty'> & {
    shipped: boolean
    onTime?: boolean
  },
) => ({ lotNo, supplier, day, ...rest })

const LOTS = [
  lotSpec('SPW-2410-031', 'sato', 0, {
    poNumber: 'KF-PO-77120',
    partNo: 'KF-BRK-2207',
    partName: 'Mounting bracket, pump skid',
    heatNo: 'H24-5521',
    qty: 1200,
    shipped: false,
  }),
  lotSpec('SPW-2410-030', 'sato', -1, {
    poNumber: 'KF-PO-77120',
    partNo: 'KF-BRK-2207',
    partName: 'Mounting bracket, pump skid',
    heatNo: 'H24-5498',
    qty: 1200,
    shipped: true,
    onTime: true,
  }),
  lotSpec('SPW-2410-029', 'sato', -2, {
    poNumber: 'KF-PO-77104',
    partNo: 'KF-CVR-1180',
    partName: 'Pump end cover',
    heatNo: 'H24-5498',
    qty: 800,
    shipped: true,
    onTime: true,
  }),
  lotSpec('SPW-2410-019', 'sato', -16, {
    poNumber: 'KF-PO-76988',
    partNo: 'KF-BRK-2207',
    partName: 'Mounting bracket, pump skid',
    heatNo: 'H24-5310',
    qty: 1200,
    shipped: true,
    onTime: false,
  }),
  lotSpec('SCV-2410-118', 'shakti', 0, {
    poNumber: 'KF-PO-51842',
    partNo: 'KV-BDY-50',
    partName: 'Gate valve body DN50 PN16, ASTM A216 WCB',
    heatNo: 'H24-0971',
    qty: 40,
    shipped: false,
  }),
  lotSpec('SCV-2410-117', 'shakti', -1, {
    poNumber: 'KF-PO-51842',
    partNo: 'KV-BDY-50',
    partName: 'Gate valve body DN50 PN16, ASTM A216 WCB',
    heatNo: 'H24-0966',
    qty: 40,
    shipped: true,
    onTime: true,
  }),
  lotSpec('SCV-2410-116', 'shakti', -2, {
    poNumber: 'KF-PO-51842',
    partNo: 'KV-BDY-50',
    partName: 'Gate valve body DN50 PN16, ASTM A216 WCB',
    heatNo: 'H24-0958',
    qty: 40,
    shipped: true,
    onTime: true,
  }),
  lotSpec('SCV-2410-109', 'shakti', -9, {
    poNumber: 'KF-PO-51790',
    partNo: 'KV-BNT-50',
    partName: 'Bonnet DN50 PN16, ASTM A216 WCB',
    heatNo: 'H24-0921',
    qty: 60,
    shipped: true,
    onTime: true,
  }),
]

export const lotIdByNo: Record<string, string> = Object.fromEntries(
  LOTS.map((l) => [l.lotNo, id(`lot:${l.lotNo}`)]),
)

export function buildTrust(ctx: SeedContext) {
  const { clock } = ctx
  const local = (supplier: 'sato' | 'shakti', day: number, hhmm: string) =>
    clock.local(day, hhmm, supplier === 'sato' ? JST : IST)
  const siteOf = (supplier: 'sato' | 'shakti') => (supplier === 'sato' ? S.sato : S.shakti)

  const lots: Lot[] = LOTS.map((l) => ({
    id: lotIdByNo[l.lotNo] ?? id(`lot:${l.lotNo}`),
    tenantId: l.supplier === 'sato' ? T.sato : T.shakti,
    siteId: siteOf(l.supplier),
    buyerTenantId: T.kestrel,
    lotNo: l.lotNo,
    poNumber: l.poNumber,
    partNo: l.partNo,
    partName: l.partName,
    heatNo: l.heatNo,
    qty: l.qty,
    template: l.supplier === 'sato' ? 'stamping' : 'valve',
    producedAt: local(l.supplier, l.day, '09:00'),
    shippedAt: l.shipped ? local(l.supplier, l.day, '16:30') : undefined,
    deliveredOnTime: l.onTime,
  }))

  const passports: Passport[] = LOTS.map((l) => {
    const lotId = lotIdByNo[l.lotNo] ?? ''
    const siteId = siteOf(l.supplier)
    const by = l.supplier === 'sato' ? U.kenji : U.meena
    const at = local(l.supplier, l.day, '12:00')
    const ev = (
      key: string,
      kind: 'photo' | 'scan',
      caption: string,
      extracted?: Record<string, unknown>,
    ) => ctx.ev(`passport:${l.lotNo}:${key}`, { kind, siteId, by, at, caption, extracted })

    const cert = ev(
      'cert',
      'scan',
      `Material certificate, heat ${l.lotNo === 'SCV-2410-118' ? 'H24-0917' : l.heatNo}`,
      {
        heatNo: l.lotNo === 'SCV-2410-118' ? 'H24-0917' : l.heatNo,
      },
    )
    const lineHeat = ev('line-heat', 'photo', `Heat number captured at the line, ${l.heatNo}`, {
      heatNo: l.heatNo,
    })
    const dims = ev(
      'dims',
      'scan',
      l.supplier === 'sato'
        ? 'CMM report, 9 of 9 critical dimensions'
        : 'Dimensional report, 12 of 12 critical dimensions',
    )

    const heatOk = l.lotNo !== 'SCV-2410-118'
    const checks: Passport['checks'] = [
      {
        rule: 'heat_match',
        result: heatOk ? 'pass' : 'fail',
        detail: heatOk
          ? `Certificate heat ${l.heatNo} matches line capture ${l.heatNo}.`
          : 'Certificate heat H24-0917 does not match line capture H24-0971.',
        evidenceIds: [cert, lineHeat],
        explanation: heatOk
          ? undefined
          : 'Two digits transposed. Request the correct mill certificate for heat H24-0971 or re-check the body stamps.',
      },
    ]
    if (l.supplier === 'shakti') {
      const chem = ev('chem', 'scan', 'Chemistry: C 0.22, Mn 0.84, Si 0.41, P 0.021, S 0.014', {
        C: 0.22,
        Mn: 0.84,
        Si: 0.41,
      })
      const hydro = ev('hydro', 'scan', 'Hydro chart: 24 bar shell, 120 s', {
        pressureBar: 24,
        durationS: 120,
      })
      checks.push(
        {
          rule: 'chemistry_in_grade',
          result: 'pass',
          detail: 'C 0.22 ≤ 0.30, Mn 0.84 ≤ 1.00, Si 0.41 ≤ 0.60 (ASTM A216 WCB).',
          evidenceIds: [chem],
        },
        l.lotNo === 'SCV-2410-116'
          ? {
              rule: 'hydro_test',
              result: 'warn',
              detail: '3 of 40 retested after gasket change; all passed 24 bar for 120 s.',
              evidenceIds: [hydro, EVENT_IDS.hydroLeak],
              explanation: 'Retest records attached. Buyer may ask for the gasket batch.',
            }
          : {
              rule: 'hydro_test',
              result: 'pass',
              detail: 'Shell 24 bar held 120 s ≥ ITP 24 bar for 60 s.',
              evidenceIds: [hydro],
            },
      )
    }
    checks.push(
      {
        rule: 'dimensions_complete',
        result: 'pass',
        detail:
          l.supplier === 'sato'
            ? '9 of 9 critical dimensions reported.'
            : '12 of 12 critical dimensions reported.',
        evidenceIds: [dims],
      },
      {
        rule: 'hash_unchanged',
        result: 'pass',
        detail: 'All referenced evidence matches its stored hash.',
        evidenceIds: [],
      },
    )

    const overall: Passport['overall'] = checks.some((c) => c.result === 'fail')
      ? 'fail'
      : checks.some((c) => c.result === 'warn')
        ? 'warn'
        : 'pass'
    const sealed = l.day < 0
    return {
      lotId,
      version: l.lotNo === 'SCV-2410-118' ? 2 : 1,
      status: overall === 'fail' ? 'needs_fix' : sealed ? 'sealed' : 'ready',
      checks,
      overall,
      sealedAt: sealed ? local(l.supplier, l.day, '13:40') : undefined,
      sealedBy: sealed ? by : undefined,
    }
  })

  const ncrs: Ncr[] = [
    {
      id: id('ncr:0412'),
      number: 'NCR-0412',
      buyerTenantId: T.kestrel,
      supplierTenantId: T.shakti,
      lotId: lotIdByNo['SCV-2410-109'] ?? '',
      title: 'Bonnet leak at body–bonnet joint during assembly test',
      description:
        '3 of 60 bonnets from lot SCV-2410-109 leaked at 24 bar during valve assembly test at Kestrel Pune. Parts quarantined at goods-in.',
      raisedBy: U.arjun,
      raisedAt: local('shakti', -3, '11:30'),
      status: 'eight_d_draft',
      eightD: {
        d1Team:
          'Meena Pillai (QA, lead), Ramesh Iyer (MD), Sunil Yadav (fettling), Arjun Mehta (Kestrel SQE, reviewer).',
        d2Problem:
          '3 of 60 bonnets (5%) from lot SCV-2410-109 leaked at the body–bonnet joint at 24 bar. All three from the second pour of heat H24-0921.',
        d3Containment:
          'Remaining 57 bonnets re-tested at 24 bar at Kestrel: 0 leaks. 40 bonnets in Shakti stock on hold until retest.',
        d4RootCause:
          'Hypothesis: gasket seating face porosity from a cold second pour. Supported by the sand-hole event on 2 bodies and the lower pour temperature logged for that heat.',
        d5Corrective:
          'Raise minimum pour temperature to 1,560 °C with a pyrometer photo at every pour; add dye-penetrant check on the seating face for the next 5 lots.',
        d6Implement:
          'Pour temperature check added to the daily checklist (QP-MLT-03 rev 2). Dye-penetrant check starts with lot SCV-2410-119.',
        d7Prevent:
          'Pour temperature and seating-face checks become part of the bonnet control plan; reviewed in the weekly quality report.',
        d8Closure:
          'Close when 5 consecutive lots pass with no seating-face indications and no leaks at Kestrel.',
        citations: [
          { field: 'd2Problem', evidenceId: EVENT_IDS.hydroLeak },
          { field: 'd3Containment', evidenceId: EVENT_IDS.hydroLeak },
          { field: 'd4RootCause', evidenceId: id('event:sand-hole-d2') },
          { field: 'd5Corrective', evidenceId: id('evidence:check:shakti:pour-temp:07:00') },
          { field: 'd6Implement', evidenceId: id('evidence:check:shakti:pour-temp:07:00') },
          { field: 'd7Prevent', evidenceId: id('evidence:report:shakti:daily') },
        ],
        similarCases: ['NCR-0377 (Surya Precision Castings, porosity on flange face)'],
      },
      thread: [
        {
          id: 't1',
          authorId: U.arjun,
          text: 'Raised from goods-in. Photos and test log attached. Please confirm containment on your stock today.',
          evidenceIds: [],
          at: local('shakti', -3, '11:30'),
        },
        {
          id: 't2',
          authorId: U.meena,
          text: '40 bonnets in stock are on hold. Retest starts this afternoon; results will be in the daily report.',
          evidenceIds: [EVENT_IDS.hydroLeak],
          at: local('shakti', -3, '14:05'),
        },
      ],
    },
    {
      id: id('ncr:0398'),
      number: 'NCR-0398',
      buyerTenantId: T.kestrel,
      supplierTenantId: T.sato,
      lotId: lotIdByNo['SPW-2410-019'] ?? '',
      title: 'Hole pitch out of tolerance found at goods-in',
      description:
        '2 of 200 sampled brackets measured 48.12–48.14 mm hole pitch (spec 48.00 ± 0.10).',
      raisedBy: U.arjun,
      raisedAt: local('sato', -15, '10:00'),
      status: 'accepted',
      eightDApprovedBy: U.kenji,
      cycleId: CYCLE_IDS.pitch,
      eightD: {
        d1Team:
          'Kenji Mori (quality, lead), Nguyen Thi Lan (press line lead), Haruka Sato (owner).',
        d2Problem: '2 of 200 sampled brackets from lot SPW-2410-019 had hole pitch 48.12–48.14 mm.',
        d3Containment:
          'All 1,200 brackets of the lot re-measured at Sato: 11 out of tolerance, scrapped. Stock of 2 lots checked: 0 found.',
        d4RootCause:
          'Worn pilot pins on die D-114 let the strip shift during progression. Wear measured at 0.06 mm.',
        d5Corrective:
          'Pilot pins replaced. Hole-pitch check every 2 hours with photo, added to the daily checklist.',
        d6Implement: 'Done on day 9 of the cycle; verification running for 14 days.',
        d7Prevent:
          'Die stroke count recorded at every change; pilot pins replaced at 150,000 strokes.',
        d8Closure: 'Accepted by Kestrel. Improvement cycle stays open until verification ends.',
        citations: [
          { field: 'd2Problem', evidenceId: EVENT_IDS.pitchD4 },
          { field: 'd3Containment', evidenceId: EVENT_IDS.pitchD4 },
          { field: 'd4RootCause', evidenceId: id('evidence:improvement:pilot-pin-worn') },
          { field: 'd5Corrective', evidenceId: id('evidence:improvement:pilot-pin-new') },
          { field: 'd6Implement', evidenceId: id('evidence:improvement:pilot-pin-new') },
          { field: 'd7Prevent', evidenceId: id('evidence:check:sato:hole-pitch:06:00') },
        ],
        similarCases: [],
      },
      thread: [],
    },
  ]

  const consents: Consent[] = [
    {
      id: id('consent:sato-kestrel'),
      supplierTenantId: T.sato,
      buyerTenantId: T.kestrel,
      scope: ['maturity', 'cycles', 'passports', 'reports'],
      expiresAt: local('sato', 9, '23:59'),
      createdBy: U.haruka,
      createdAt: local('sato', -81, '10:00'),
    },
    {
      id: id('consent:shakti-kestrel'),
      supplierTenantId: T.shakti,
      buyerTenantId: T.kestrel,
      scope: ['passports', 'reports', 'cycles'],
      expiresAt: local('shakti', 120, '23:59'),
      createdBy: U.ramesh,
      createdAt: local('shakti', -60, '10:00'),
    },
    ...[T.hayashi, T.vinhAn, T.deccan, T.kurosawa, T.mitra, T.surya].map((supplierTenantId, i) => ({
      id: id(`consent:${supplierTenantId}-kestrel`),
      supplierTenantId,
      buyerTenantId: T.kestrel,
      scope: ['maturity', 'passports', 'reports'] as Consent['scope'],
      expiresAt: local('sato', 60 + i * 15, '23:59'),
      createdBy: supplierTenantId,
      createdAt: local('sato', -90 + i * 5, '10:00'),
    })),
    {
      id: id('consent:tanaka-kestrel'),
      supplierTenantId: T.tanaka,
      buyerTenantId: T.kestrel,
      scope: ['passports'],
      expiresAt: local('sato', 30, '23:59'),
      revokedAt: local('sato', -12, '09:00'),
      createdBy: T.tanaka,
      createdAt: local('sato', -120, '10:00'),
    },
  ]

  const invoices: Invoice[] = [
    {
      id: id('inv:sato:1'),
      supplierTenantId: T.sato,
      buyerTenantId: T.kestrel,
      number: 'SPW-INV-2409-14',
      amount: 1_842_000,
      currency: 'JPY',
      issuedAt: local('sato', -62, '10:00'),
      termDays: 45,
      paidAt: local('sato', -20, '10:00'),
    },
    {
      id: id('inv:sato:2'),
      supplierTenantId: T.sato,
      buyerTenantId: T.kestrel,
      number: 'SPW-INV-2409-28',
      amount: 1_910_400,
      currency: 'JPY',
      issuedAt: local('sato', -41, '10:00'),
      termDays: 45,
    },
    {
      id: id('inv:sato:3'),
      supplierTenantId: T.sato,
      buyerTenantId: T.kestrel,
      number: 'SPW-INV-2410-12',
      amount: 1_768_800,
      currency: 'JPY',
      issuedAt: local('sato', -6, '10:00'),
      termDays: 45,
    },
    {
      id: id('inv:shakti:1'),
      supplierTenantId: T.shakti,
      buyerTenantId: T.kestrel,
      number: 'SCV/24-25/0871',
      amount: 684_000,
      currency: 'INR',
      issuedAt: local('shakti', -58, '10:00'),
      termDays: 45,
      paidAt: local('shakti', -9, '10:00'),
    },
    {
      id: id('inv:shakti:2'),
      supplierTenantId: T.shakti,
      buyerTenantId: T.kestrel,
      number: 'SCV/24-25/0902',
      amount: 712_500,
      currency: 'INR',
      issuedAt: local('shakti', -30, '10:00'),
      termDays: 45,
    },
  ]

  const reports = buildReports(ctx)

  const lastReport = (day: number, hhmm: string, offset = JST) => clock.local(day, hhmm, offset)
  const dims = (
    capture: number,
    standardisation: number,
    traceability: number,
    decision_use: number,
    people_cadence: number,
  ) => ({
    capture,
    standardisation,
    traceability,
    decision_use,
    people_cadence,
  })

  const scorecards: SupplierScorecard[] = [
    {
      tenantId: T.sato,
      ladder: 1,
      siteIndex: 1.6,
      drift: 'improving',
      trend: [1.1, 1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.5, 1.5, 1.6, 1.6],
      dimensions: dims(2, 2, 2, 1, 2),
      checklistAdherence30d: 0.94,
      firstTimeRight: 0.97,
      ftrStreak: 38,
      openNcrs: 0,
      eightDMedianDays: 6,
      otif: 0.96,
      inspectionTier: 'normal',
      suggestedTier: 'reduced',
      paymentOnTime: 0.67,
      lastReportAt: lastReport(0, '07:30'),
    },
    {
      tenantId: T.shakti,
      ladder: 2,
      siteIndex: 2.1,
      drift: 'stable',
      trend: [2.2, 2.2, 2.2, 2.1, 2.1, 2.1, 2.1, 2.1, 2.0, 2.1, 2.1, 2.1],
      dimensions: dims(2, 2, 3, 2, 1),
      checklistAdherence30d: 0.88,
      firstTimeRight: 0.91,
      ftrStreak: 4,
      openNcrs: 1,
      eightDMedianDays: 9,
      otif: 0.93,
      inspectionTier: 'normal',
      paymentOnTime: 0.5,
      lastReportAt: lastReport(0, '08:00', IST),
    },
    {
      tenantId: T.hayashi,
      ladder: 3,
      siteIndex: 3.2,
      drift: 'improving',
      trend: [2.6, 2.7, 2.7, 2.8, 2.9, 2.9, 3.0, 3.0, 3.1, 3.1, 3.2, 3.2],
      dimensions: dims(3, 3, 4, 3, 3),
      checklistAdherence30d: 0.99,
      firstTimeRight: 0.995,
      ftrStreak: 112,
      openNcrs: 0,
      eightDMedianDays: 4,
      otif: 0.99,
      inspectionTier: 'reduced',
      paymentOnTime: 1,
      lastReportAt: lastReport(0, '07:00'),
    },
    {
      tenantId: T.vinhAn,
      ladder: 1,
      siteIndex: 1.2,
      drift: 'drifting',
      trend: [1.6, 1.6, 1.5, 1.5, 1.5, 1.4, 1.4, 1.3, 1.3, 1.2, 1.2, 1.2],
      dimensions: dims(1, 1, 1, 1, 2),
      checklistAdherence30d: 0.61,
      firstTimeRight: 0.84,
      ftrStreak: 0,
      openNcrs: 3,
      eightDMedianDays: 21,
      otif: 0.82,
      inspectionTier: 'tightened',
      paymentOnTime: 0.75,
      lastReportAt: lastReport(-3, '09:00'),
    },
    {
      tenantId: T.deccan,
      ladder: 2,
      siteIndex: 2.0,
      drift: 'stable',
      trend: [2.0, 2.0, 2.0, 2.0, 2.1, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0],
      dimensions: dims(2, 2, 2, 2, 2),
      checklistAdherence30d: 0.9,
      firstTimeRight: 0.95,
      ftrStreak: 17,
      openNcrs: 1,
      eightDMedianDays: 11,
      otif: 0.91,
      inspectionTier: 'normal',
      paymentOnTime: 0.8,
      lastReportAt: lastReport(-1, '18:00', IST),
    },
    {
      tenantId: T.kurosawa,
      ladder: 1,
      siteIndex: 1.4,
      drift: 'stable',
      trend: [1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4],
      dimensions: dims(1, 2, 1, 1, 1),
      checklistAdherence30d: 0.78,
      firstTimeRight: 0.93,
      ftrStreak: 9,
      openNcrs: 0,
      eightDMedianDays: 8,
      otif: 0.97,
      inspectionTier: 'normal',
      paymentOnTime: 1,
      lastReportAt: lastReport(-1, '17:00'),
    },
    {
      tenantId: T.mitra,
      ladder: 3,
      siteIndex: 2.9,
      drift: 'stable',
      trend: [2.7, 2.7, 2.8, 2.8, 2.8, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9],
      dimensions: dims(3, 3, 3, 2, 3),
      checklistAdherence30d: 0.97,
      firstTimeRight: 0.985,
      ftrStreak: 64,
      openNcrs: 0,
      eightDMedianDays: 5,
      otif: 0.98,
      inspectionTier: 'normal',
      suggestedTier: 'reduced',
      paymentOnTime: 0.9,
      lastReportAt: lastReport(0, '08:30', IST),
    },
    {
      tenantId: T.surya,
      ladder: 2,
      siteIndex: 1.8,
      drift: 'drifting',
      trend: [2.3, 2.3, 2.2, 2.2, 2.1, 2.1, 2.0, 2.0, 1.9, 1.9, 1.8, 1.8],
      dimensions: dims(2, 2, 2, 1, 1),
      checklistAdherence30d: 0.72,
      firstTimeRight: 0.88,
      ftrStreak: 2,
      openNcrs: 2,
      eightDMedianDays: 17,
      otif: 0.86,
      inspectionTier: 'normal',
      suggestedTier: 'tightened',
      paymentOnTime: 0.6,
      lastReportAt: lastReport(-6, '18:00', IST),
    },
  ]

  const certificate = (tenantId: string, name: string, validForDays: number, listedAt: string) => ({
    name,
    validTo: clock.dateOf(validForDays),
    evidenceId: ctx.ev(`cert:${tenantId}:${name}`, {
      kind: 'scan',
      siteId: PROSPECT_SITES[tenantId] ?? '',
      by: tenantId,
      at: listedAt,
      caption: `${name} certificate`,
    }),
  })
  const listed = (days: number) => clock.local(-days, '09:00', JST)

  const profiles: EvidenceProfile[] = [
    {
      tenantId: T.okada,
      ladder: 3,
      evidenceDays: 240,
      checklistAdherence90d: 0.98,
      firstTimeRight: 0.99,
      capacityNote: 'Two 300 t progressive presses; about 18% free capacity from January.',
      certifications: [
        certificate(T.okada, 'ISO 9001:2015', 410, listed(240)),
        certificate(T.okada, 'IATF 16949', 320, listed(240)),
      ],
      listedAt: listed(240),
    },
    {
      tenantId: T.lakshmi,
      ladder: 2,
      evidenceDays: 184,
      checklistAdherence90d: 0.93,
      firstTimeRight: 0.96,
      capacityNote: 'Hydro test bench up to 64 bar; can take 400 valve assemblies a month.',
      certifications: [
        certificate(T.lakshmi, 'ISO 9001:2015', 210, listed(184)),
        certificate(T.lakshmi, 'PED 2014/68/EU module H', 500, listed(184)),
      ],
      listedAt: listed(184),
    },
    {
      tenantId: T.batam,
      ladder: 2,
      evidenceDays: 96,
      checklistAdherence90d: 0.9,
      firstTimeRight: 0.94,
      capacityNote: 'Fibre laser and three press brakes; free capacity on second shift.',
      certifications: [certificate(T.batam, 'ISO 9001:2015', 150, listed(96))],
      listedAt: listed(96),
    },
    {
      tenantId: T.saigon,
      ladder: 1,
      evidenceDays: 41,
      checklistAdherence90d: 0.81,
      firstTimeRight: 0.9,
      capacityNote: 'Four 400 t die-casting cells; new customer slots from Q1.',
      certifications: [certificate(T.saigon, 'ISO 9001:2015', 90, listed(41))],
      listedAt: listed(41),
    },
  ]

  return { lots, passports, ncrs, consents, invoices, reports, scorecards, profiles }
}

function buildReports(ctx: SeedContext): QualityReport[] {
  const { clock } = ctx
  const sato = (day: number, hhmm: string) => clock.local(day, hhmm, JST)
  const ev = (key: string, day: number, caption: string) =>
    ctx.ev(`report:${key}`, {
      kind: 'photo',
      siteId: S.sato,
      by: U.lan,
      at: sato(day, '12:00'),
      caption,
    })

  const stageRows = (done: number[], due: number[], ool: number[]) =>
    [ST.blanking, ST.press2, ST.weld, ST.finalSato].map((stageId, i) => ({
      stageId,
      checksDone: done[i] ?? 0,
      checksDue: due[i] ?? 0,
      outOfLimit: ool[i] ?? 0,
    }))

  const daily = (
    day: number,
    opts: {
      done: number[]
      ool: number[]
      loss: number
      lots: number
      ftr: number
      highlight: string
      risk?: string
      action?: string
    },
  ): QualityReport => {
    const due = [3, 9, 4, 4]
    const doneTotal = opts.done.reduce((a, b) => a + b, 0)
    const oolTotal = opts.ool.reduce((a, b) => a + b, 0)
    const proof = ev(`daily:${day}`, day, `Checklist photos, ${clock.dateOf(day)}`)
    return {
      id: id(`report:sato:daily:${day}`),
      tenantId: T.sato,
      siteId: S.sato,
      period: 'daily',
      periodStart: clock.dateOf(day),
      periodEnd: clock.dateOf(day),
      status: 'published',
      metrics: {
        checksDone: doneTotal,
        checksDue: 20,
        outOfLimit: oolTotal,
        contained: oolTotal,
        eventsConfirmed: 3 + (Math.abs(day) % 3),
        lossMinutes: opts.loss,
        lotsShipped: opts.lots,
        lotsFirstTimeRight: opts.ftr,
        openNcrs: 0,
        cyclesClosed: 0,
      },
      stageRows: stageRows(opts.done, due, opts.ool),
      highlights: [{ id: 'h1', text: opts.highlight, evidenceIds: [proof] }],
      risks: opts.risk ? [{ id: 'r1', text: opts.risk, evidenceIds: [proof] }] : [],
      actions: opts.action ? [{ id: 'a1', text: opts.action, evidenceIds: [proof] }] : [],
      evidenceCount: doneTotal + 4,
      preparedAt: sato(day + 1, '06:30'),
      approvedBy: U.kenji,
      approvedAt: sato(day + 1, '07:30'),
    }
  }

  const reports: QualityReport[] = [
    daily(-1, {
      done: [3, 9, 4, 4],
      ool: [0, 0, 0, 0],
      loss: 67,
      lots: 1,
      ftr: 1,
      highlight:
        'All 20 scheduled checks on shift A were recorded with a reading or photo; none out of limit.',
      risk: 'Die change to D-114 took 42 min against a 25 min standard; clamp bolts were missing from the cart.',
      action: 'Clamp bolt set added to the die-cart shadow board check from tomorrow.',
    }),
    daily(-2, {
      done: [3, 9, 4, 4],
      ool: [0, 0, 0, 0],
      loss: 30,
      lots: 1,
      ftr: 1,
      highlight:
        'All 20 checks recorded. Light-curtain bypass found and restored; shift re-briefed.',
      risk: 'Safety event S-GUARD-BYPASS on Press line 2.',
    }),
    daily(-3, {
      done: [3, 8, 4, 4],
      ool: [0, 0, 0, 0],
      loss: 18,
      lots: 0,
      ftr: 0,
      highlight: '19 of 20 checks recorded; the 12:00 burr check was missed during a die change.',
    }),
    daily(-4, {
      done: [3, 9, 4, 4],
      ool: [0, 1, 0, 0],
      loss: 21,
      lots: 1,
      ftr: 1,
      highlight: 'Hole pitch read 48.12 mm at 10:00; 38 parts quarantined and checked, 4 scrapped.',
      risk: 'Second pitch excursion this month on die D-114.',
    }),
    daily(-5, {
      done: [3, 9, 4, 4],
      ool: [0, 0, 0, 0],
      loss: 38,
      lots: 1,
      ftr: 1,
      highlight: 'All 20 checks recorded; none out of limit.',
    }),
  ]

  const weeklyProofs = [
    ev('weekly:checklists', -1, 'Checklist evidence, 7 days'),
    ev('weekly:passports', -1, 'Passports sealed this week'),
  ]
  reports.push({
    id: id('report:sato:weekly:current'),
    tenantId: T.sato,
    siteId: S.sato,
    period: 'weekly',
    periodStart: clock.dateOf(-7),
    periodEnd: clock.dateOf(-1),
    status: 'draft',
    metrics: {
      checksDone: 138,
      checksDue: 140,
      outOfLimit: 1,
      contained: 1,
      eventsConfirmed: 24,
      lossMinutes: 241,
      lotsShipped: 5,
      lotsFirstTimeRight: 5,
      openNcrs: 0,
      cyclesClosed: 0,
    },
    stageRows: stageRows([21, 61, 28, 28], [21, 63, 28, 28], [0, 1, 0, 0]),
    highlights: [
      {
        id: 'h1',
        text: '138 of 140 scheduled checks recorded with evidence (98.6%). Both misses were burr checks during die changes.',
        evidenceIds: [weeklyProofs[0] ?? ''],
      },
      {
        id: 'h2',
        text: '5 of 5 lots shipped to Kestrel passed every passport rule first time; streak now 38 lots.',
        evidenceIds: [weeklyProofs[1] ?? ''],
      },
      {
        id: 'h3',
        text: 'Pilot pins replaced on die D-114; one pitch excursion this week against six in the previous fortnight.',
        evidenceIds: [EVENT_IDS.pitchD4],
      },
    ],
    risks: [
      {
        id: 'r1',
        text: 'Die changes averaged 40 min against a 25 min standard and caused 33% of lost time.',
        evidenceIds: [EVENT_IDS.dieChange],
      },
      {
        id: 'r2',
        text: 'One coil arrived without a mill certificate; the steel service centre has been asked to send certificates with the coil.',
        evidenceIds: [EVENT_IDS.coilCert],
      },
    ],
    actions: [
      {
        id: 'a1',
        text: 'Verification of the pitch fix continues for 6 more days before the cycle can close.',
        evidenceIds: [EVENT_IDS.pitchD4],
      },
      {
        id: 'a2',
        text: 'Die-change cart shadow board added to the start-of-shift check.',
        evidenceIds: [EVENT_IDS.dieChange],
      },
    ],
    evidenceCount: 312,
    preparedAt: sato(0, '06:30'),
  })

  reports.push({
    id: id('report:sato:weekly:previous'),
    tenantId: T.sato,
    siteId: S.sato,
    period: 'weekly',
    periodStart: clock.dateOf(-14),
    periodEnd: clock.dateOf(-8),
    status: 'published',
    metrics: {
      checksDone: 131,
      checksDue: 140,
      outOfLimit: 3,
      contained: 3,
      eventsConfirmed: 29,
      lossMinutes: 318,
      lotsShipped: 5,
      lotsFirstTimeRight: 5,
      openNcrs: 1,
      cyclesClosed: 0,
    },
    stageRows: stageRows([20, 57, 27, 27], [21, 63, 28, 28], [0, 3, 0, 0]),
    highlights: [
      {
        id: 'h1',
        text: '131 of 140 checks recorded with evidence (93.6%).',
        evidenceIds: [ev('weekly-prev', -8, 'Checklist evidence, 7 days')],
      },
    ],
    risks: [
      {
        id: 'r1',
        text: 'Three hole-pitch excursions on die D-114; NCR-0398 raised by Kestrel.',
        evidenceIds: [EVENT_IDS.pitchD4],
      },
    ],
    actions: [
      {
        id: 'a1',
        text: 'Improvement cycle opened: stop hole-pitch drift on Press line 2.',
        evidenceIds: [EVENT_IDS.pitchD4],
      },
    ],
    evidenceCount: 296,
    preparedAt: sato(-7, '06:30'),
    approvedBy: U.haruka,
    approvedAt: sato(-7, '08:10'),
  })

  const shaktiProof = ctx.ev('report:shakti:daily', {
    kind: 'photo',
    siteId: S.shakti,
    by: U.meena,
    at: clock.local(-1, '18:00', IST),
    caption: 'Checklist evidence, foundry',
  })
  reports.push({
    id: id('report:shakti:daily:-1'),
    tenantId: T.shakti,
    siteId: S.shakti,
    period: 'daily',
    periodStart: clock.dateOf(-1),
    periodEnd: clock.dateOf(-1),
    status: 'published',
    metrics: {
      checksDone: 9,
      checksDue: 9,
      outOfLimit: 0,
      contained: 0,
      eventsConfirmed: 2,
      lossMinutes: 35,
      lotsShipped: 1,
      lotsFirstTimeRight: 1,
      openNcrs: 1,
      cyclesClosed: 0,
    },
    stageRows: [ST.melt, ST.fettle, ST.cnc, ST.hydro, ST.finalShakti].map((stageId, i) => ({
      stageId,
      checksDone: [4, 0, 2, 2, 1][i] ?? 0,
      checksDue: [4, 0, 2, 2, 1][i] ?? 0,
      outOfLimit: 0,
    })),
    highlights: [
      {
        id: 'h1',
        text: 'All 9 checks recorded, including pour temperature at both pours (1,571 °C and 1,588 °C).',
        evidenceIds: [shaktiProof],
      },
    ],
    risks: [
      {
        id: 'r1',
        text: '3 of 40 bodies in lot SCV-2410-116 leaked at hydro test; gasket replaced and all three passed on retest.',
        evidenceIds: [EVENT_IDS.hydroLeak],
      },
    ],
    actions: [
      {
        id: 'a1',
        text: 'NCR-0412 8D draft prepared; dye-penetrant check on bonnet seating face starts with lot SCV-2410-119.',
        evidenceIds: [EVENT_IDS.hydroLeak],
      },
    ],
    evidenceCount: 14,
    preparedAt: clock.local(0, '06:30', IST),
    approvedBy: U.meena,
    approvedAt: clock.local(0, '08:00', IST),
  })

  return reports
}
