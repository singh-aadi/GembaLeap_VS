import {
  BUYER_ROLES,
  ById,
  sealReport,
  SUPPLIER_ROLES,
  type QualityReport,
  type User,
} from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { activeConsent, requireConsent, requireRole, requireTenantAccess } from '@/lib/auth.server'
import {
  appendAudit,
  db,
  evidenceRefs,
  must,
  now,
  verifyAuditChain,
  type Db,
} from '@/lib/store.server'

function summary(store: Db, report: QualityReport, viewerTenantId: string) {
  const site = store.sites.find((s) => s.id === report.siteId)
  return {
    id: report.id,
    period: report.period,
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    status: report.status,
    supplierName: store.tenants.find((t) => t.id === report.tenantId)?.name ?? '',
    supplierTenantId: report.tenantId,
    checksDone: report.metrics.checksDone,
    checksDue: report.metrics.checksDue,
    outOfLimit: report.metrics.outOfLimit,
    lotsShipped: report.metrics.lotsShipped,
    lotsFirstTimeRight: report.metrics.lotsFirstTimeRight,
    sealHash: report.sealHash,
    approvedAt: report.approvedAt,
    timeZone: site?.timeZone ?? 'UTC',
    /** For the supplier: has any buyer opened it. For a buyer: has someone on their own team. */
    viewed: store.audit.some(
      (a) =>
        a.action === 'buyer.view' &&
        a.objectRef === `reports/${report.id}` &&
        store.users.some(
          (u) =>
            u.id === a.actorId &&
            (viewerTenantId === report.tenantId
              ? u.tenantId !== report.tenantId
              : u.tenantId === viewerTenantId),
        ),
    ),
  }
}

export const listReports = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ supplier: z.string().optional() }))
  .handler(async ({ data, context: { user } }) => {
    const store = await db()
    const isBuyer = (BUYER_ROLES as readonly string[]).includes(user.role)
    if (!isBuyer) requireRole(user, ['supplier_owner', 'supplier_quality'])
    const visible = store.reports.filter((r) =>
      isBuyer
        ? r.status === 'published' &&
          activeConsent(store, r.tenantId, user.tenantId)?.scope.includes('reports') &&
          (!data.supplier || r.tenantId === data.supplier)
        : r.tenantId === user.tenantId,
    )
    const suppliers = isBuyer
      ? [
          ...new Set(
            store.reports
              .filter((r) =>
                activeConsent(store, r.tenantId, user.tenantId)?.scope.includes('reports'),
              )
              .map((r) => r.tenantId),
          ),
        ].map((id) => ({
          id,
          name: store.tenants.find((t) => t.id === id)?.name ?? '',
        }))
      : []
    return {
      reports: visible
        .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd) || (a.period === 'weekly' ? -1 : 1))
        .map((r) => summary(store, r, user.tenantId)),
      suppliers,
    }
  })

function readable(store: Db, user: User, reportId: string) {
  const report = must(
    store.reports.find((r) => r.id === reportId),
    'report',
  )
  if ((SUPPLIER_ROLES as readonly string[]).includes(user.role)) {
    requireRole(user, ['supplier_owner', 'supplier_quality'])
    requireTenantAccess(user, report.tenantId)
  } else {
    requireRole(user, BUYER_ROLES)
    requireConsent(store, user, report.tenantId, 'reports')
    if (report.status !== 'published') throw new AppError('NOT_FOUND', 'report')
  }
  return report
}

export const getReport = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    const store = await db()
    const report = readable(store, user, data.id)
    const site = must(
      store.sites.find((s) => s.id === report.siteId),
      'site',
    )
    const isBuyer = user.tenantId !== report.tenantId
    if (
      isBuyer &&
      !store.audit.some(
        (a) =>
          a.action === 'buyer.view' &&
          a.actorId === user.id &&
          a.objectRef === `reports/${report.id}`,
      )
    ) {
      await appendAudit(store, {
        tenantId: report.tenantId,
        actorId: user.id,
        action: 'buyer.view',
        objectRef: `reports/${report.id}`,
        at: now(store),
      })
    }
    const claims = [...report.highlights, ...report.risks, ...report.actions]
    const entry = store.audit.find((a) => a.seq === report.auditSeq)
    return {
      report,
      supplierName: store.tenants.find((t) => t.id === report.tenantId)?.name ?? '',
      siteName: site.name,
      timeZone: site.timeZone,
      stageNames: Object.fromEntries(
        store.stages.filter((s) => s.siteId === site.id).map((s) => [s.id, s.name]),
      ),
      approvedByName: store.users.find((u) => u.id === report.approvedBy)?.name,
      evidence: evidenceRefs(
        store,
        claims.flatMap((c) => c.evidenceIds),
      ),
      auditEntry: entry
        ? { seq: entry.seq, hash: entry.hash, prevHash: entry.prevHash, at: entry.at }
        : null,
      buyers: store.consents
        .filter(
          (c) =>
            c.supplierTenantId === report.tenantId &&
            !c.revokedAt &&
            c.expiresAt > now(store) &&
            c.scope.includes('reports'),
        )
        .map((c) => store.tenants.find((t) => t.id === c.buyerTenantId)?.name ?? ''),
    }
  })

export const publishReport = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['supplier_owner', 'supplier_quality'])
    const store = await db()
    const report = must(
      store.reports.find((r) => r.id === data.id),
      'report',
    )
    requireTenantAccess(user, report.tenantId)
    if (report.status === 'published') throw new AppError('CONFLICT', 'already published')
    const at = now(store)
    report.status = 'published'
    report.approvedBy = user.id
    report.approvedAt = at
    report.sealHash = await sealReport(report)
    const entry = await appendAudit(store, {
      tenantId: report.tenantId,
      actorId: user.id,
      action: 'report.publish',
      objectRef: `reports/${report.id}`,
      at,
    })
    report.auditSeq = entry.seq
    return { sealHash: report.sealHash, auditSeq: entry.seq }
  })

/** Server half of verification: the whole audit chain re-hashes and the report's entry is in it. */
export const verifyReportChain = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    const store = await db()
    const report = readable(store, user, data.id)
    const chainIntact = await verifyAuditChain(store)
    const entry = store.audit.find((a) => a.seq === report.auditSeq)
    return {
      chainIntact,
      entryFound: Boolean(
        entry && entry.objectRef === `reports/${report.id}` && entry.action === 'report.publish',
      ),
      chainLength: store.audit.length,
    }
  })
