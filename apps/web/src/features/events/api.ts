import { ById, ConfirmEventInput, EventFilters, SUPPLIER_ROLES } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole, requireTenantAccess, siteOf } from '@/lib/auth.server'
import { appendAudit, db, evidenceRefs, must, now } from '@/lib/store.server'

export const listEvents = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(EventFilters)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const site = siteOf(store, user)
    const stages = store.stages
      .filter((s) => s.siteId === site.id)
      .sort((a, b) => a.order - b.order)
    const rows = store.events
      .filter((e) => e.siteId === site.id)
      .filter((e) => !data.stage || e.stageId === data.stage)
      .filter((e) => !data.type || e.type === data.type)
      .filter((e) => !data.status || e.status === data.status)
      .sort(
        (a, b) =>
          (data.sort === 'severity' ? b.severity - a.severity : 0) ||
          b.createdAt.localeCompare(a.createdAt),
      )
      .map((e) => ({
        id: e.id,
        createdAt: e.createdAt,
        stage: stages.find((s) => s.id === e.stageId)?.name ?? { en: '' },
        type: e.type,
        codes: e.codes,
        summary: e.summaryLocal || e.summaryEn,
        lotNo: store.lots.find((l) => l.id === e.lotId)?.lotNo,
        severity: e.severity,
        lossMinutes: e.lossMinutes,
        status: e.status,
        evidenceCount: e.evidenceIds.length,
      }))
    return {
      rows,
      stages: stages.map((s) => ({ id: s.id, name: s.name })),
      timeZone: site.timeZone,
    }
  })

export const getEvent = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const event = must(
      store.events.find((e) => e.id === data.id),
      'event',
    )
    requireTenantAccess(user, event.tenantId)
    const site = must(
      store.sites.find((s) => s.id === event.siteId),
      'site',
    )
    const codeCatalogue = [
      ...new Set(
        store.events
          .filter((e) => e.siteId === site.id && e.type === event.type)
          .flatMap((e) => e.codes),
      ),
    ].sort()
    return {
      event,
      stage: store.stages.find((s) => s.id === event.stageId),
      lot: store.lots.find((l) => l.id === event.lotId),
      author: store.users.find((u) => u.id === event.createdBy)?.name ?? '',
      evidence: evidenceRefs(store, event.evidenceIds),
      codeCatalogue,
      timeZone: site.timeZone,
      auditSeq: store.audit.find(
        (a) => a.action === 'event.confirm' && a.objectRef === `events/${event.id}`,
      )?.seq,
    }
  })

export const confirmEvent = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ConfirmEventInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const event = must(
      store.events.find((e) => e.id === data.eventId),
      'event',
    )
    requireTenantAccess(user, event.tenantId)
    if (event.status === 'confirmed') throw new AppError('CONFLICT', 'already confirmed')
    if (
      data.stageId &&
      !store.stages.some((s) => s.id === data.stageId && s.siteId === event.siteId)
    ) {
      throw new AppError('VALIDATION', 'stage')
    }
    event.codes = data.codes ?? event.codes
    event.stageId = data.stageId ?? event.stageId
    event.status = 'confirmed'
    event.confirmedAt = now(store)
    const entry = await appendAudit(store, {
      tenantId: event.tenantId,
      actorId: user.id,
      action: 'event.confirm',
      objectRef: `events/${event.id}`,
      at: event.confirmedAt,
    })
    return { event, auditSeq: entry.seq }
  })
