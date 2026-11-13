import { z } from 'zod'

export const Id = z.ulid()
export type Id = z.infer<typeof Id>

export const Timestamp = z.iso.datetime()
export const CalendarDate = z.iso.date()

/** Launch languages for India (mr, hi, ta, gu, kn, en) plus ja, vi, id carried from the first pilot. */
export const Locale = z.enum(['en', 'mr', 'hi', 'ta', 'gu', 'kn', 'ja', 'vi', 'id'])
export type Locale = z.infer<typeof Locale>

/** `sutra` is the SutraOS coaching organisation; its coaches baseline and map plants. */
export const TenantKind = z.enum(['buyer', 'supplier', 'sutra'])
export type TenantKind = z.infer<typeof TenantKind>

export const Role = z.enum([
  'operator',
  'supplier_owner',
  'line_lead',
  'supplier_quality',
  'buyer_quality',
  'buyer_procurement',
  'sutra_coach',
])
export type Role = z.infer<typeof Role>

export const SUPPLIER_ROLES = [
  'operator',
  'supplier_owner',
  'line_lead',
  'supplier_quality',
] as const
export const BUYER_ROLES = ['buyer_quality', 'buyer_procurement'] as const
export const COACH_ROLES = ['sutra_coach'] as const

export const Level = z.number().int().min(0).max(5)
export type Level = z.infer<typeof Level>

/** The five Sutra Baseline dimensions, each scored L0–L5 with evidence. */
export const Dimension = z.enum([
  'standard_work',
  'inspection_evidence',
  'problem_solving',
  'delivery_flow',
  'data_connectivity',
])
export type Dimension = z.infer<typeof Dimension>

export const EventType = z.enum(['defect', 'downtime', 'material', 'safety', 'idea'])
export type EventType = z.infer<typeof EventType>

export const Sha256 = z.string().regex(/^[a-f0-9]{64}$/)

/** Tenant-authored text (checklist labels, stage names) in one or more languages. `en` is required. */
export const LocalizedText = z.object({
  en: z.string().min(1),
  mr: z.string().min(1).optional(),
  gu: z.string().min(1).optional(),
  kn: z.string().min(1).optional(),
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
