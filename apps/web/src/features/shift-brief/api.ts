import { ShiftBrief, SUPPLIER_ROLES, type Claim } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { checklistState } from '@/features/checklist/checklist.server'
import { agentsConfigured, callAgent } from '@/lib/agents.server'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { db, evidenceRefs, newId, now, type Db } from '@/lib/store.server'
import { zonedInstant } from '@/lib/time'

export const getShiftBrief = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const site = siteOf(store, user)
    const brief = store.briefs
      .filter((b) => b.siteId === site.id)
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0]
    if (!brief)
      return { brief: null, evidence: {}, timeZone: site.timeZone, acknowledgedByName: null }
    const ids = [...brief.happened, ...brief.watch].flatMap((c) => c.evidenceIds)
    return {
      brief,
      evidence: evidenceRefs(store, ids),
      timeZone: site.timeZone,
      acknowledgedByName: store.users.find((u) => u.id === brief.acknowledgedBy)?.name ?? null,
    }
  })

/**
 * Builds the brief for the current shift. The agent writes the prose; without
 * it, the brief is assembled from the same records so every line still cites
 * its evidence.
 */
export const generateShiftBrief = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const site = siteOf(store, user)
    const brief = agentsConfigured()
      ? await callAgent('/agents/shift-brief', site.tenantId, { siteId: site.id }, ShiftBrief)
      : assembleBrief(store, site.id)
    store.briefs.push(brief)
    return { id: brief.id }
  })

export const acknowledgeShiftBrief = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const site = siteOf(store, user)
    const brief = store.briefs
      .filter((b) => b.siteId === site.id)
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0]
    if (!brief) throw new AppError('NOT_FOUND', 'brief')
    brief.acknowledgedBy = user.id
    brief.acknowledgedAt = now(store)
    return { ok: true }
  })

function assembleBrief(store: Db, siteId: string): ShiftBrief {
  const site = store.sites.find((s) => s.id === siteId)
  if (!site) throw new AppError('NOT_FOUND', 'site')
  const checklist = checklistState(store, site)
  const shiftStart = zonedInstant(checklist.date, '06:00', site.timeZone)
  const shiftEnd = zonedInstant(checklist.date, '14:00', site.timeZone)
  const events = store.events.filter(
    (e) => e.siteId === siteId && e.createdAt >= shiftStart && e.createdAt < shiftEnd,
  )

  const happened: Claim[] = [...events]
    .sort((a, b) => (b.lossMinutes ?? 0) - (a.lossMinutes ?? 0))
    .slice(0, 4)
    .map((e) => ({ id: e.id, text: e.summaryEn || e.summaryLocal, evidenceIds: [e.id] }))

  const watch: Claim[] = checklist.stages.flatMap((stage) =>
    stage.items.flatMap((entry) =>
      entry.slots.flatMap((slot) =>
        slot.record?.containment
          ? [
              {
                id: slot.record.id,
                text: slot.record.containment,
                evidenceIds: slot.record.evidenceIds,
              },
            ]
          : [],
      ),
    ),
  )

  const losses = new Map<string, number>()
  for (const e of events) {
    const label = e.codes[0] ?? e.type
    losses.set(label, (losses.get(label) ?? 0) + (e.lossMinutes ?? 0))
  }

  return {
    id: newId(),
    siteId,
    shift: 'A',
    shiftStart,
    shiftEnd,
    generatedAt: now(store),
    happened,
    watch,
    pareto: [...losses.entries()]
      .map(([label, minutes]) => ({ label, minutes }))
      .sort((a, b) => b.minutes - a.minutes),
    checks: {
      done: checklist.summary.done,
      due: checklist.summary.dueSoFar,
      outOfLimit: checklist.summary.outOfLimit,
    },
  }
}
