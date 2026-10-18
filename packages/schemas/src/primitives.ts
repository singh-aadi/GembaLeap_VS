import { z } from 'zod'

export const Id = z.ulid()
export type Id = z.infer<typeof Id>

export const Timestamp = z.iso.datetime()
export const CalendarDate = z.iso.date()

export const Locale = z.enum(['en', 'ja', 'vi', 'hi', 'ta', 'id'])
export type Locale = z.infer<typeof Locale>

export const TenantKind = z.enum(['buyer', 'supplier'])
export type TenantKind = z.infer<typeof TenantKind>

export const Role = z.enum([
  'supplier_owner',
  'line_lead',
  'supplier_quality',
  'buyer_quality',
  'buyer_procurement',
])
export type Role = z.infer<typeof Role>

export const SUPPLIER_ROLES = ['supplier_owner', 'line_lead', 'supplier_quality'] as const
export const BUYER_ROLES = ['buyer_quality', 'buyer_procurement'] as const

export const Level = z.number().int().min(0).max(5)
export type Level = z.infer<typeof Level>

export const Dimension = z.enum([
  'capture',
  'standardisation',
  'traceability',
  'decision_use',
  'people_cadence',
])
export type Dimension = z.infer<typeof Dimension>

export const EventType = z.enum(['defect', 'downtime', 'material', 'safety', 'idea'])
export type EventType = z.infer<typeof EventType>

export const Sha256 = z.string().regex(/^[a-f0-9]{64}$/)

/** Tenant-authored text (checklist labels, stage names) in one or more languages. `en` is required. */
export const LocalizedText = z.object({
  en: z.string().min(1),
  ja: z.string().min(1).optional(),
  vi: z.string().min(1).optional(),
  hi: z.string().min(1).optional(),
  ta: z.string().min(1).optional(),
  id: z.string().min(1).optional(),
})
export type LocalizedText = z.infer<typeof LocalizedText>

/** A statement in an AI-drafted document. Every claim must point at evidence. */
export const Claim = z.object({
  id: z.string(),
  text: z.string().max(300),
  evidenceIds: z.array(Id).min(1),
})
export type Claim = z.infer<typeof Claim>
