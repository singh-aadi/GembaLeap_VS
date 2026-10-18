import { z } from 'zod'
import { EventType, Id, Locale, Sha256, Timestamp } from './primitives'

export const EvidenceKind = z.enum(['photo', 'audio', 'scan', 'file'])
export type EvidenceKind = z.infer<typeof EvidenceKind>

export const EvidenceItem = z.object({
  id: Id,
  tenantId: Id,
  siteId: Id,
  kind: EvidenceKind,
  storagePath: z.string(),
  sha256: Sha256,
  caption: z.string().max(140).optional(),
  extracted: z.record(z.string(), z.unknown()).optional(),
  createdBy: Id,
  createdAt: Timestamp,
})
export type EvidenceItem = z.infer<typeof EvidenceItem>

export const Event = z.object({
  id: Id,
  tenantId: Id,
  siteId: Id,
  stageId: Id,
  type: EventType,
  codes: z.array(z.string()).max(5),
  lotId: Id.optional(),
  severity: z.number().int().min(1).max(5),
  lossMinutes: z.number().nonnegative().optional(),
  summaryEn: z.string().max(400),
  summaryLocal: z.string().max(400),
  summaryJa: z.string().max(400).optional(),
  locale: Locale,
  evidenceIds: z.array(Id),
  status: z.enum(['draft', 'confirmed']),
  createdBy: Id,
  createdAt: Timestamp,
  confirmedAt: Timestamp.optional(),
})
export type Event = z.infer<typeof Event>

export const CreateEventDraftInput = z.object({
  siteId: Id,
  stageId: Id.optional(),
  type: EventType.optional(),
  locale: Locale,
  text: z.string().max(1000).optional(),
  lotNo: z.string().max(40).optional(),
  media: z
    .array(
      z.object({
        kind: z.enum(['photo', 'audio', 'scan']),
        storagePath: z.string(),
        sha256: Sha256,
      }),
    )
    .max(6),
})
export type CreateEventDraftInput = z.infer<typeof CreateEventDraftInput>
