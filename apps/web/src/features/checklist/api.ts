import {
  evaluateMeasurement,
  RecordCheckInput,
  SUPPLIER_ROLES,
  type CheckRequirement,
  type CheckResult,
} from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { logger } from '@/lib/logger.server'
import { appendAudit, db, must, newId, now } from '@/lib/store.server'
import { zonedDate } from '@/lib/time'
import { checklistState } from './checklist.server'

export const getChecklist = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    return checklistState(store, siteOf(store, user))
  })

/**
 * Records one check. Evidence is mandatory, the pass/fail result is computed
 * here from the limits (never taken from the client), and anything outside
 * the limits needs a containment note before it is accepted.
 */
export const recordCheck = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(RecordCheckInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_ROLES)
    const store = await db()
    const site = siteOf(store, user)
    const item = must(
      store.checklistItems.find((i) => i.id === data.itemId && i.siteId === site.id),
      'checklist item',
    )
    if (!item.slots.includes(data.slot)) throw new AppError('VALIDATION', 'slot')

    const at = now(store)
    const shiftDate = zonedDate(at, site.timeZone)
    if (
      store.checkRecords.some(
        (r) => r.itemId === item.id && r.slot === data.slot && r.shiftDate === shiftDate,
      )
    ) {
      throw new AppError('CONFLICT', 'already recorded')
    }

    const result = evaluate(item.requirement, data)
    if (result !== 'pass' && !data.containment?.trim())
      throw new AppError('VALIDATION', 'containment required')

    const evidenceIds = data.evidence.map((e) => {
      const evidenceId = newId()
      store.evidence.push({
        id: evidenceId,
        tenantId: site.tenantId,
        siteId: site.id,
        kind: e.kind,
        storagePath: e.storagePath,
        sha256: e.sha256,
        caption: item.label.en,
        extracted: data.value === undefined ? undefined : { reading: data.value },
        createdBy: user.id,
        createdAt: at,
      })
      return evidenceId
    })

    const record = {
      id: newId(),
      itemId: item.id,
      siteId: site.id,
      stageId: item.stageId,
      shiftDate,
      shift: 'A' as const,
      slot: data.slot,
      result,
      value: data.value,
      text: data.text,
      containment: data.containment?.trim() || undefined,
      evidenceIds,
      recordedBy: user.id,
      recordedAt: at,
    }
    store.checkRecords.push(record)
    await appendAudit(store, {
      tenantId: site.tenantId,
      actorId: user.id,
      action: 'check.record',
      objectRef: `checks/${record.id}`,
      at,
    })
    logger.info('check recorded', {
      feature: 'checklist',
      tenantId: site.tenantId,
      userId: user.id,
      result,
    })
    return record
  })

function evaluate(
  requirement: CheckRequirement,
  data: { value?: number; passed?: boolean; text?: string },
): CheckResult {
  switch (requirement.kind) {
    case 'measurement':
      if (data.value === undefined) throw new AppError('VALIDATION', 'reading required')
      return evaluateMeasurement(requirement, data.value)
    case 'confirm':
      if (data.passed === undefined) throw new AppError('VALIDATION', 'answer required')
      return data.passed ? 'pass' : 'fail'
    case 'scan':
      if (!data.text?.trim()) throw new AppError('VALIDATION', 'scanned value required')
      return 'pass'
    case 'photo':
      return 'pass'
  }
}
