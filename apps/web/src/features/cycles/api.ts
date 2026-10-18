import { ById, CloseCycleInput, SUPPLIER_ROLES } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { appendAudit, db, evidenceRefs, must, newId, now } from '@/lib/store.server'

export const getCycle = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const site = siteOf(store, user)
    const cycle = must(
      store.cycles.find((c) => c.id === data.id && c.siteId === site.id),
      'cycle',
    )
    return {
      cycle,
      stage: store.stages.find((s) => s.id === cycle.stageId)?.name ?? { en: '' },
      ncrs: store.ncrs
        .filter((n) => n.cycleId === cycle.id)
        .map((n) => ({ id: n.id, number: n.number, status: n.status })),
      evidence: evidenceRefs(store, [...cycle.beforeEvidenceIds, ...cycle.verificationEvidenceIds]),
      timeZone: site.timeZone,
      canClose: user.role !== 'line_lead',
    }
  })

/**
 * A cycle closes only on new evidence: at least one item captured after the
 * fix was applied, plus the measured result. Paper closure is not possible.
 */
export const closeCycle = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(CloseCycleInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['supplier_owner', 'supplier_quality'])
    const store = await db()
    const site = siteOf(store, user)
    const cycle = must(
      store.cycles.find((c) => c.id === data.cycleId && c.siteId === site.id),
      'cycle',
    )
    if (cycle.status === 'closed') throw new AppError('CONFLICT', 'closed')
    if (!cycle.fixAppliedAt) throw new AppError('VALIDATION', 'fix not applied')
    const at = now(store)
    const ids = data.evidence.map((e) => {
      const evidenceId = newId()
      store.evidence.push({
        id: evidenceId,
        tenantId: site.tenantId,
        siteId: site.id,
        kind: 'photo',
        storagePath: e.storagePath,
        sha256: e.sha256,
        caption: 'Verification evidence',
        createdBy: user.id,
        createdAt: at,
      })
      return evidenceId
    })
    cycle.verificationEvidenceIds.push(...ids)
    cycle.result = { value: data.resultValue }
    cycle.status = 'closed'
    cycle.closedAt = at
    await appendAudit(store, {
      tenantId: site.tenantId,
      actorId: user.id,
      action: 'cycle.close',
      objectRef: `cycles/${cycle.id}`,
      at,
    })
    return { ok: true }
  })
