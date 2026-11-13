import type { AuditAction, AuditEntryBody, Consent } from '@sutraos/schemas'
import { buildCheckRecords, checklistItems } from './checklists'
import { createClock, demoDate, IST, JST } from './clock'
import { createContext } from './context'
import { buildEvents } from './events'
import { id } from './ids'
import { buildImprovement } from './improvement'
import { sites, stages, T, tenants, U, users } from './tenants'
import { buildSutra } from './sutra'
import { buildTrust, lotIdByNo } from './trust'

export { DEMO_ACCOUNTS } from './accounts'
export { priority } from './improvement'
export { S, ST, T, U } from './tenants'
export { schemes, skills } from './sutra'

/** Builds the full synthetic dataset for one demo date. Pure apart from reading SEED_DATE. */
export function buildSeed(date: string = demoDate()) {
  const clock = createClock(date)
  const ctx = createContext(clock)

  const checkRecords = buildCheckRecords(ctx)
  const events = buildEvents(ctx, lotIdByNo)
  const improvement = buildImprovement(ctx)
  const built = buildTrust(ctx)
  const sutra = buildSutra(ctx)
  const shindeConsent: Consent = {
    id: id('consent:shinde-kestrel'),
    supplierTenantId: T.shinde,
    buyerTenantId: T.kestrel,
    scope: ['maturity', 'passports', 'reports', 'cycles'],
    expiresAt: clock.local(80, '23:59', IST),
    createdBy: U.suresh,
    createdAt: clock.local(-11, '18:00', IST),
  }
  const trust = {
    ...built,
    consents: [...built.consents, shindeConsent],
    invoices: [...built.invoices, ...sutra.invoices],
    scorecards: [
      ...built.scorecards,
      {
        tenantId: T.shinde,
        ladder: 1,
        siteIndex: 1.2,
        trend: [0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0, 1.1, 1.2, 1.2],
        dimensions: {
          standard_work: 1,
          inspection_evidence: 1,
          problem_solving: 0,
          delivery_flow: 2,
          data_connectivity: 1,
        },
        checklistAdherence30d: 0.91,
        firstTimeRight: 0.94,
        ftrStreak: 6,
        openNcrs: 0,
        eightDMedianDays: 0,
        otif: 0.92,
        drift: 'improving' as const,
        inspectionTier: 'tightened' as const,
        suggestedTier: 'normal' as const,
        paymentOnTime: 0.33,
        lastReportAt: clock.local(0, '08:30', IST),
      },
    ],
  }

  type Entry = Omit<AuditEntryBody, 'seq'>
  const entry = (
    tenantId: string,
    actorId: string,
    action: AuditAction,
    objectRef: string,
    at: string,
  ): Entry => ({
    tenantId,
    actorId,
    action,
    objectRef,
    at,
  })
  const tenantOfLot = (lotId: string) => trust.lots.find((l) => l.id === lotId)?.tenantId ?? ''

  const entries: Entry[] = [
    ...trust.consents.map((c) =>
      entry(c.supplierTenantId, c.createdBy, 'consent.grant', `consents/${c.id}`, c.createdAt),
    ),
    ...trust.passports.flatMap((p) =>
      p.sealedAt && p.sealedBy
        ? [
            entry(
              tenantOfLot(p.lotId),
              p.sealedBy,
              'passport.seal',
              `lots/${p.lotId}/passport`,
              p.sealedAt,
            ),
          ]
        : [],
    ),
    ...trust.reports.flatMap((r) =>
      r.approvedBy && r.approvedAt
        ? [entry(r.tenantId, r.approvedBy, 'report.publish', `reports/${r.id}`, r.approvedAt)]
        : [],
    ),
    ...events.flatMap((e) =>
      e.confirmedAt
        ? [entry(e.tenantId, e.createdBy, 'event.confirm', `events/${e.id}`, e.confirmedAt)]
        : [],
    ),
    entry(
      T.sato,
      U.arjun,
      'buyer.view',
      `reports/${id('report:sato:daily:-1')}`,
      clock.local(0, '09:12', JST),
    ),
    entry(
      T.shakti,
      U.arjun,
      'buyer.view',
      `lots/${lotIdByNo['SCV-2410-117']}/passport`,
      clock.local(0, '09:40', IST),
    ),
  ]
  const auditLog: AuditEntryBody[] = entries
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((entry, i) => ({ ...entry, seq: i + 1 }))

  return {
    date,
    now: clock.now,
    tenants,
    sites,
    stages,
    users,
    checklistItems: [...checklistItems, ...sutra.items],
    checkRecords: [...checkRecords, ...sutra.records],
    events,
    evidence: ctx.evidence,
    ...improvement,
    ...trust,
    plantProfiles: sutra.profiles,
    baselines: sutra.baselines,
    processMaps: sutra.processMaps,
    skills: sutra.skills,
    plantSkills: sutra.plantSkills,
    auditPacks: sutra.auditPacks,
    rewardRules: sutra.rewardRules,
    schemes: sutra.schemes,
    auditLog,
  }
}

export type Seed = ReturnType<typeof buildSeed>
