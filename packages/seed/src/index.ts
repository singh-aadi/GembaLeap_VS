import type { AuditAction, AuditEntryBody } from '@gembaleap/schemas'
import { buildCheckRecords, checklistItems } from './checklists'
import { createClock, demoDate, IST, JST } from './clock'
import { createContext } from './context'
import { buildEvents } from './events'
import { id } from './ids'
import { buildImprovement } from './improvement'
import { sites, stages, T, tenants, U, users } from './tenants'
import { buildTrust, lotIdByNo } from './trust'

export { DEMO_ACCOUNTS } from './accounts'
export { priority } from './improvement'
export { S, ST, T, U } from './tenants'

/** Builds the full synthetic dataset for one demo date. Pure apart from reading SEED_DATE. */
export function buildSeed(date: string = demoDate()) {
  const clock = createClock(date)
  const ctx = createContext(clock)

  const checkRecords = buildCheckRecords(ctx)
  const events = buildEvents(ctx, lotIdByNo)
  const improvement = buildImprovement(ctx)
  const trust = buildTrust(ctx)

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
    checklistItems,
    checkRecords,
    events,
    evidence: ctx.evidence,
    ...improvement,
    ...trust,
    auditLog,
  }
}

export type Seed = ReturnType<typeof buildSeed>
