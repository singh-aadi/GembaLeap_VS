import { SUPPLIER_ROLES } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { checklistState } from '@/features/checklist/checklist.server'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { db, now } from '@/lib/store.server'

const DAY = 86_400_000

export const getSupplierHome = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const site = siteOf(store, user)
    const at = now(store)
    const checklist = checklistState(store, site)
    const tenantId = site.tenantId

    const draftReport = store.reports.find((r) => r.tenantId === tenantId && r.status === 'draft')
    const ncrToApprove = store.ncrs.find(
      (n) => n.supplierTenantId === tenantId && n.status === 'eight_d_draft',
    )
    const passportToFix = store.passports.find(
      (p) =>
        p.status === 'needs_fix' &&
        store.lots.some((l) => l.id === p.lotId && l.tenantId === tenantId),
    )
    const disputed = store.scores.filter(
      (s) =>
        s.state === 'disputed' &&
        store.stages.some((st) => st.id === s.stageId && st.siteId === site.id),
    ).length
    const draftEvents = store.events.filter(
      (e) => e.siteId === site.id && e.status === 'draft',
    ).length
    const expiring = store.consents.find(
      (c) =>
        c.supplierTenantId === tenantId &&
        !c.revokedAt &&
        Date.parse(c.expiresAt) - Date.parse(at) < 14 * DAY &&
        c.expiresAt > at,
    )

    const decisions = [
      draftReport && {
        kind: 'report' as const,
        id: draftReport.id,
        period: draftReport.period,
        start: draftReport.periodStart,
        end: draftReport.periodEnd,
      },
      ncrToApprove && { kind: 'eightD' as const, id: ncrToApprove.id, number: ncrToApprove.number },
      passportToFix && {
        kind: 'passport' as const,
        id: passportToFix.lotId,
        lotNo: store.lots.find((l) => l.id === passportToFix.lotId)?.lotNo ?? '',
      },
      draftEvents > 0 && { kind: 'events' as const, count: draftEvents },
      disputed > 0 && { kind: 'disputes' as const, count: disputed },
      expiring && {
        kind: 'consent' as const,
        buyer: store.tenants.find((t) => t.id === expiring.buyerTenantId)?.name ?? '',
        days: Math.ceil((Date.parse(expiring.expiresAt) - Date.parse(at)) / DAY),
      },
    ].filter((d) => d !== false && d !== undefined)

    const buyers = store.consents
      .filter((c) => c.supplierTenantId === tenantId && !c.revokedAt && c.expiresAt > at)
      .map((c) => {
        const card = store.scorecards.find((s) => s.tenantId === tenantId)
        const open = store.invoices.filter(
          (i) =>
            i.supplierTenantId === tenantId && i.buyerTenantId === c.buyerTenantId && !i.paidAt,
        )
        return {
          buyerName: store.tenants.find((t) => t.id === c.buyerTenantId)?.name ?? '',
          ftrStreak: card?.ftrStreak ?? 0,
          inspectionTier: card?.inspectionTier ?? 'normal',
          suggestedTier: card?.suggestedTier,
          reportsPublished7d: store.reports.filter(
            (r) =>
              r.tenantId === tenantId &&
              r.status === 'published' &&
              r.approvedAt &&
              Date.parse(at) - Date.parse(r.approvedAt) < 7 * DAY,
          ).length,
          invoices: open.map((i) => ({
            number: i.number,
            day: Math.floor((Date.parse(at) - Date.parse(i.issuedAt)) / DAY),
            term: i.termDays,
          })),
        }
      })

    const topBottleneck = store.bottlenecks
      .filter((b) => b.siteId === site.id)
      .sort((a, b) => a.rank - b.rank)[0]
    const recentEvents = store.events
      .filter((e) => e.siteId === site.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        type: e.type,
        summary: e.summaryLocal || e.summaryEn,
        createdAt: e.createdAt,
        status: e.status,
      }))

    return {
      checklist: {
        summary: checklist.summary,
        date: checklist.date,
        stages: checklist.stages.map(({ id, name, done, scheduled }) => ({
          id,
          name,
          done,
          scheduled,
        })),
      },
      nextChecks: checklist.stages
        .flatMap((s) =>
          s.items.flatMap((entry) =>
            entry.slots
              .filter((slot) => !slot.record)
              .map((slot) => ({
                itemId: entry.item.id,
                label: entry.item.label,
                slot: slot.slot,
                status: slot.status,
                stage: s.name,
              })),
          ),
        )
        .sort((a, b) => a.slot.localeCompare(b.slot))
        .slice(0, 4),
      decisions,
      buyers,
      ladder: { level: site.ladderLevel, index: site.siteIndex },
      topBottleneck: topBottleneck
        ? { title: topBottleneck.title, cycleId: topBottleneck.cycleId }
        : null,
      recentEvents,
      brief: store.briefs
        .filter((b) => b.siteId === site.id)
        .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0]?.generatedAt,
      timeZone: site.timeZone,
      siteName: site.name,
    }
  })
