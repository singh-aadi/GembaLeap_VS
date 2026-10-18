import { z } from 'zod'
import { Id, Level, Locale, LocalizedText, Role, TenantKind } from './primitives'

export const Sector = z.enum([
  'industrial_equipment',
  'stamping',
  'castings',
  'machining',
  'forging',
  'surface',
  'seals',
  'springs',
])
export type Sector = z.infer<typeof Sector>

export const Tenant = z.object({
  id: Id,
  name: z.string(),
  kind: TenantKind,
  country: z.enum(['JP', 'IN', 'VN', 'ID', 'MY', 'TH']),
  city: z.string(),
  sector: Sector,
  processes: z.array(z.string()),
  locale: Locale,
  /** Supplier opted in to show an evidence profile to buyers it has no consent with. */
  openProfile: z.boolean().default(false),
  synthetic: z.literal(true),
})
export type Tenant = z.infer<typeof Tenant>

export const Site = z.object({
  id: Id,
  tenantId: Id,
  name: z.string(),
  timeZone: z.string(),
  ladderLevel: Level,
  siteIndex: z.number().min(0).max(5),
})
export type Site = z.infer<typeof Site>

export const Stage = z.object({
  id: Id,
  siteId: Id,
  name: LocalizedText,
  order: z.number().int(),
  weight: z.number().positive(),
})
export type Stage = z.infer<typeof Stage>

export const User = z.object({
  id: Id,
  tenantId: Id,
  role: Role,
  name: z.string(),
  title: z.string(),
  locale: Locale,
  languages: z.array(Locale).min(1),
  siteIds: z.array(Id),
})
export type User = z.infer<typeof User>
