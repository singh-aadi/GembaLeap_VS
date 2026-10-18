import { CreateEventDraftInput, Event, SUPPLIER_ROLES } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { agentsConfigured, callAgent } from '@/lib/agents.server'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole, requireTenantAccess, siteOf } from '@/lib/auth.server'
import { logger } from '@/lib/logger.server'
import { db, newId, now } from '@/lib/store.server'

export const getCaptureContext = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const site = siteOf(store, user)
    return {
      siteId: site.id,
      locale: user.locale,
      stages: store.stages.filter((s) => s.siteId === site.id).sort((a, b) => a.order - b.order),
      openLots: store.lots
        .filter((l) => l.siteId === site.id && !l.shippedAt)
        .map((l) => ({ id: l.id, lotNo: l.lotNo, partNo: l.partNo })),
    }
  })

/**
 * Stores the media references and asks the Capture agent for a structured draft.
 * Without the agent service the draft keeps the operator's own words and
 * suggests the most frequent code for the stage; a person confirms either way.
 */
export const createEventDraft = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(CreateEventDraftInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const site = siteOf(store, user)
    requireTenantAccess(user, site.tenantId)
    if (data.siteId !== site.id) throw new AppError('FORBIDDEN', 'site')

    const at = now(store)
    const evidenceIds = data.media.map((m) => {
      const evidenceId = newId()
      store.evidence.push({
        id: evidenceId,
        tenantId: site.tenantId,
        siteId: site.id,
        kind: m.kind,
        storagePath: m.storagePath,
        sha256: m.sha256,
        caption: undefined,
        createdBy: user.id,
        createdAt: at,
      })
      return evidenceId
    })

    const stageId = data.stageId ?? store.stages.find((s) => s.siteId === site.id)?.id ?? ''
    const type = data.type ?? 'defect'
    const lotId = data.lotNo
      ? store.lots.find((l) => l.siteId === site.id && l.lotNo === data.lotNo)?.id
      : undefined

    const draft: Event = agentsConfigured()
      ? await callAgent('/agents/capture', site.tenantId, { ...data, evidenceIds }, Event)
      : {
          id: newId(),
          tenantId: site.tenantId,
          siteId: site.id,
          stageId,
          type,
          codes: suggestCodes(store.events, stageId, type),
          lotId,
          severity: 3,
          summaryEn: data.locale === 'en' ? (data.text ?? '') : '',
          summaryLocal: data.text ?? '',
          locale: data.locale,
          evidenceIds,
          status: 'draft',
          createdBy: user.id,
          createdAt: at,
        }

    store.events.push(draft)
    logger.info('event draft created', {
      feature: 'capture',
      tenantId: site.tenantId,
      userId: user.id,
      eventId: draft.id,
    })
    return { id: draft.id }
  })

function suggestCodes(events: Event[], stageId: string, type: Event['type']): string[] {
  const counts = new Map<string, number>()
  for (const e of events) {
    if (e.stageId !== stageId || e.type !== type) continue
    for (const code of e.codes) counts.set(code, (counts.get(code) ?? 0) + 1)
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  return top ? [top[0]] : []
}
