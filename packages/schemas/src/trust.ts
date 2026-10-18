import { z } from 'zod'
import { CalendarDate, Claim, Dimension, Id, Level, Sha256, Timestamp } from './primitives'

export const EightD = z.object({
  d1Team: z.string(),
  d2Problem: z.string(),
  d3Containment: z.string(),
  d4RootCause: z.string(),
  d5Corrective: z.string(),
  d6Implement: z.string(),
  d7Prevent: z.string(),
  d8Closure: z.string(),
  citations: z.array(z.object({ field: z.string(), evidenceId: Id })).min(1),
  similarCases: z.array(z.string()),
})
export type EightD = z.infer<typeof EightD>

export const EIGHT_D_FIELDS = [
  'd1Team',
  'd2Problem',
  'd3Containment',
  'd4RootCause',
  'd5Corrective',
  'd6Implement',
  'd7Prevent',
  'd8Closure',
] as const satisfies readonly (keyof EightD)[]

export const NcrStatus = z.enum([
  'open',
  'eight_d_draft',
  'eight_d_submitted',
  'accepted',
  'closed',
])
export type NcrStatus = z.infer<typeof NcrStatus>

export const Ncr = z.object({
  id: Id,
  number: z.string(),
  buyerTenantId: Id,
  supplierTenantId: Id,
  lotId: Id,
  title: z.string(),
  description: z.string(),
  raisedBy: Id,
  raisedAt: Timestamp,
  status: NcrStatus,
  eightD: EightD.optional(),
  eightDApprovedBy: Id.optional(),
  cycleId: Id.optional(),
  thread: z.array(
    z.object({
      id: z.string(),
      authorId: Id,
      text: z.string().max(1000),
      evidenceIds: z.array(Id),
      at: Timestamp,
    }),
  ),
})
export type Ncr = z.infer<typeof Ncr>

export const PassportRule = z.enum([
  'heat_match',
  'chemistry_in_grade',
  'hydro_test',
  'dimensions_complete',
  'hash_unchanged',
])
export type PassportRule = z.infer<typeof PassportRule>

export const PassportCheck = z.object({
  rule: PassportRule,
  result: z.enum(['pass', 'warn', 'fail']),
  detail: z.string(),
  evidenceIds: z.array(Id),
  explanation: z.string().optional(),
})
export type PassportCheck = z.infer<typeof PassportCheck>

export const Lot = z.object({
  id: Id,
  tenantId: Id,
  siteId: Id,
  buyerTenantId: Id,
  lotNo: z.string(),
  poNumber: z.string(),
  partNo: z.string(),
  partName: z.string(),
  heatNo: z.string().optional(),
  qty: z.number().int().positive(),
  template: z.enum(['valve', 'stamping']),
  producedAt: Timestamp,
  shippedAt: Timestamp.optional(),
  deliveredOnTime: z.boolean().optional(),
})
export type Lot = z.infer<typeof Lot>

export const Passport = z.object({
  lotId: Id,
  version: z.number().int().min(1),
  status: z.enum(['building', 'needs_fix', 'ready', 'sealed']),
  checks: z.array(PassportCheck),
  overall: z.enum(['pass', 'warn', 'fail']),
  sealedHash: Sha256.optional(),
  sealedAt: Timestamp.optional(),
  sealedBy: Id.optional(),
})
export type Passport = z.infer<typeof Passport>

export const ConsentScope = z.enum(['maturity', 'cycles', 'passports', 'reports'])
export type ConsentScope = z.infer<typeof ConsentScope>

export const Consent = z.object({
  id: Id,
  supplierTenantId: Id,
  buyerTenantId: Id,
  scope: z.array(ConsentScope).min(1),
  expiresAt: Timestamp,
  revokedAt: Timestamp.optional(),
  createdBy: Id,
  createdAt: Timestamp,
})
export type Consent = z.infer<typeof Consent>

export const GrantConsentInput = z.object({
  buyerTenantId: Id,
  scope: z.array(ConsentScope).min(1),
  expiresAt: CalendarDate,
})

export const AuditAction = z.enum([
  'event.confirm',
  'check.record',
  'report.publish',
  'score.review',
  'consent.grant',
  'consent.revoke',
  'passport.seal',
  'eightd.approve',
  'cycle.open',
  'cycle.close',
  'buyer.view',
])
export type AuditAction = z.infer<typeof AuditAction>

export const AuditEntry = z.object({
  seq: z.number().int().min(1),
  tenantId: Id,
  actorId: Id,
  action: AuditAction,
  objectRef: z.string(),
  at: Timestamp,
  prevHash: Sha256,
  hash: Sha256,
})
export type AuditEntry = z.infer<typeof AuditEntry>

/** Daily or weekly built-in-quality report. Drafted by an agent, approved by a person, then sealed. */
export const QualityReport = z.object({
  id: Id,
  tenantId: Id,
  siteId: Id,
  period: z.enum(['daily', 'weekly']),
  periodStart: CalendarDate,
  periodEnd: CalendarDate,
  status: z.enum(['draft', 'published']),
  metrics: z.object({
    checksDone: z.number().int(),
    checksDue: z.number().int(),
    outOfLimit: z.number().int(),
    contained: z.number().int(),
    eventsConfirmed: z.number().int(),
    lossMinutes: z.number(),
    lotsShipped: z.number().int(),
    lotsFirstTimeRight: z.number().int(),
    openNcrs: z.number().int(),
    cyclesClosed: z.number().int(),
  }),
  stageRows: z.array(
    z.object({
      stageId: Id,
      checksDone: z.number().int(),
      checksDue: z.number().int(),
      outOfLimit: z.number().int(),
    }),
  ),
  highlights: z.array(Claim),
  risks: z.array(Claim),
  actions: z.array(Claim),
  evidenceCount: z.number().int(),
  preparedAt: Timestamp,
  approvedBy: Id.optional(),
  approvedAt: Timestamp.optional(),
  sealHash: Sha256.optional(),
  auditSeq: z.number().int().optional(),
})
export type QualityReport = z.infer<typeof QualityReport>

export const Drift = z.enum(['improving', 'stable', 'drifting'])
export type Drift = z.infer<typeof Drift>

export const InspectionTier = z.enum(['tightened', 'normal', 'reduced'])
export type InspectionTier = z.infer<typeof InspectionTier>

/** One row of the buyer heat-map. Only built for suppliers with an active consent. */
export const SupplierScorecard = z.object({
  tenantId: Id,
  ladder: Level,
  siteIndex: z.number(),
  trend: z.array(z.number()).length(12),
  dimensions: z.record(Dimension, Level),
  checklistAdherence30d: z.number().min(0).max(1),
  firstTimeRight: z.number().min(0).max(1),
  ftrStreak: z.number().int(),
  openNcrs: z.number().int(),
  eightDMedianDays: z.number(),
  otif: z.number().min(0).max(1),
  lastReportAt: Timestamp.optional(),
  drift: Drift,
  inspectionTier: InspectionTier,
  suggestedTier: InspectionTier.optional(),
  /** Share of this buyer's invoices from the supplier paid within the agreed term. */
  paymentOnTime: z.number().min(0).max(1),
})
export type SupplierScorecard = z.infer<typeof SupplierScorecard>

/** What a supplier with `openProfile` shows to buyers it has not yet shared with. */
export const EvidenceProfile = z.object({
  tenantId: Id,
  ladder: Level,
  evidenceDays: z.number().int(),
  checklistAdherence90d: z.number().min(0).max(1),
  firstTimeRight: z.number().min(0).max(1),
  capacityNote: z.string(),
  certifications: z.array(z.object({ name: z.string(), validTo: CalendarDate, evidenceId: Id })),
  listedAt: Timestamp,
})
export type EvidenceProfile = z.infer<typeof EvidenceProfile>

export const Invoice = z.object({
  id: Id,
  supplierTenantId: Id,
  buyerTenantId: Id,
  number: z.string(),
  amount: z.number(),
  currency: z.enum(['JPY', 'INR']),
  issuedAt: Timestamp,
  termDays: z.number().int(),
  paidAt: Timestamp.optional(),
})
export type Invoice = z.infer<typeof Invoice>

export const AskInput = z.object({
  question: z.string().trim().min(3).max(500),
  supplierTenantId: Id.optional(),
})

export const AskAnswer = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  claims: z.array(Claim),
  searched: z.number().int(),
  source: z.enum(['agent', 'local_index']),
})
export type AskAnswer = z.infer<typeof AskAnswer>
