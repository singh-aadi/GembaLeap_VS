import { z } from 'zod'
import { CalendarDate, Id, LocalizedText, Timestamp } from './primitives'

/**
 * What a check needs before it can be saved. Evidence is mandatory for every
 * kind: a tick without a photo, reading or scan is not accepted.
 */
export const CheckRequirement = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('measurement'),
    unit: z.string(),
    min: z.number(),
    max: z.number(),
    /** Decimal places the gauge reads to, e.g. 2 for 48.03 mm. */
    decimals: z.number().int().min(0).max(4),
  }),
  z.object({ kind: z.literal('photo') }),
  z.object({ kind: z.literal('scan'), field: z.enum(['heat_no', 'coil_no', 'gauge_id']) }),
  z.object({ kind: z.literal('confirm') }),
])
export type CheckRequirement = z.infer<typeof CheckRequirement>

export const Shift = z.enum(['A', 'B', 'C'])
export type Shift = z.infer<typeof Shift>

export const ChecklistItem = z.object({
  id: Id,
  siteId: Id,
  stageId: Id,
  label: LocalizedText,
  /** Work instruction this check enforces, e.g. "WI-PR2-04 rev C". */
  standardRef: z.string(),
  requirement: CheckRequirement,
  /** Local plant times (HH:mm) at which the check is due during the shift. */
  slots: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
  critical: z.boolean(),
})
export type ChecklistItem = z.infer<typeof ChecklistItem>

export const CheckResult = z.enum(['pass', 'out_of_limit', 'fail'])
export type CheckResult = z.infer<typeof CheckResult>

export const CheckRecord = z.object({
  id: Id,
  itemId: Id,
  siteId: Id,
  stageId: Id,
  shiftDate: CalendarDate,
  shift: Shift,
  slot: z.string(),
  result: CheckResult,
  value: z.number().optional(),
  text: z.string().max(80).optional(),
  /** Required when result is not pass: what was done to stop bad parts moving on. */
  containment: z.string().max(400).optional(),
  evidenceIds: z.array(Id).min(1),
  recordedBy: Id,
  recordedAt: Timestamp,
})
export type CheckRecord = z.infer<typeof CheckRecord>

export const RecordCheckInput = z
  .object({
    itemId: Id,
    slot: z.string(),
    value: z.number().optional(),
    text: z.string().max(80).optional(),
    passed: z.boolean().optional(),
    containment: z.string().max(400).optional(),
    evidence: z
      .array(
        z.object({
          kind: z.enum(['photo', 'scan']),
          storagePath: z.string(),
          sha256: z.string().regex(/^[a-f0-9]{64}$/),
        }),
      )
      .min(1),
  })
  .strict()
export type RecordCheckInput = z.infer<typeof RecordCheckInput>

/** Status of one due slot, derived on the server from the item, its records and the clock. */
export const SlotStatus = z.enum(['done', 'out_of_limit', 'due', 'overdue', 'upcoming'])
export type SlotStatus = z.infer<typeof SlotStatus>

export function evaluateMeasurement(
  requirement: Extract<CheckRequirement, { kind: 'measurement' }>,
  value: number,
): CheckResult {
  return value >= requirement.min && value <= requirement.max ? 'pass' : 'out_of_limit'
}
