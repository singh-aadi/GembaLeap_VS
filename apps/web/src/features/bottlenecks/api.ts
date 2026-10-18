import { ById, FACTOR_LOADING } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { maturityView } from '@/features/maturity/maturity.server'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { appendAudit, db, must, newId, now } from '@/lib/store.server'

const ROLES = ['supplier_owner', 'supplier_quality'] as const

export const listBottlenecks = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, ROLES)
    const store = await db()
    const site = siteOf(store, user)
    const rows = store.bottlenecks
      .filter((b) => b.siteId === site.id)
      .sort((a, b) => a.rank - b.rank)
      .map((b) => ({
        ...b,
        stage: store.stages.find((s) => s.id === b.stageId)?.name ?? { en: '' },
        loading: FACTOR_LOADING[b.factor],
        cycleStatus: store.cycles.find((c) => c.id === b.cycleId)?.status,
      }))
    return { rows, canOpen: user.role === 'supplier_owner' }
  })

/** The owner picks the bottleneck; the cycle targets one ladder level up on that stage only. */
export const openCycle = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['supplier_owner'])
    const store = await db()
    const site = siteOf(store, user)
    const bottleneck = must(
      store.bottlenecks.find((b) => b.id === data.id && b.siteId === site.id),
      'bottleneck',
    )
    if (bottleneck.cycleId) throw new AppError('CONFLICT', 'cycle exists')
    const level =
      maturityView(store, site.id)?.stages.find((s) => s.id === bottleneck.stageId)?.level ?? 0
    const at = now(store)
    const cycle = {
      id: newId(),
      siteId: site.id,
      bottleneckId: bottleneck.id,
      stageId: bottleneck.stageId,
      title: bottleneck.title,
      fromLevel: level,
      targetLevel: Math.min(5, level + 1),
      plan: [],
      openedAt: at,
      dueAt: new Date(Date.parse(at) + 30 * 86_400_000).toISOString(),
      status: 'open' as const,
      baseline: {
        metric: `Loss from ${bottleneck.codes.join(', ')} per 30 days`,
        value: bottleneck.lossMinutes30d,
        unit: 'min',
      },
      beforeEvidenceIds: [],
      verificationEvidenceIds: [],
    }
    store.cycles.push(cycle)
    bottleneck.cycleId = cycle.id
    await appendAudit(store, {
      tenantId: site.tenantId,
      actorId: user.id,
      action: 'cycle.open',
      objectRef: `cycles/${cycle.id}`,
      at,
    })
    return { id: cycle.id }
  })
