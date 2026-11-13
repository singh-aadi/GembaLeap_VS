import { z } from 'zod'
import { CalendarDate, Dimension, Id, Level, Timestamp } from './primitives'

/** Sutra Maturity Ladder. A plant's level is the lowest evidenced dimension of its critical stages. */
export const SUTRA_LEVELS = [
  { level: 0, key: 'invisible', external: 'none' },
  { level: 1, key: 'recorded', external: 'zed_bronze' },
  { level: 2, key: 'controlled', external: 'iso9001' },
  { level: 3, key: 'proven', external: 'zed_silver' },
  { level: 4, key: 'improving', external: 'zed_gold' },
  { level: 5, key: 'connected', external: 'data_space' },
] as const

/** Storage follows the plant: T1 lives in the supplier's own Google Drive and Sheets. */
export const StorageTier = z.enum(['t1_lite', 't2_core', 't3_connected'])
export type StorageTier = z.infer<typeof StorageTier>

export const PlantProfile = z.object({
  siteId: Id,
  tenantId: Id,
  udyamNo: z.string(),
  employees: z.number().int().positive(),
  turnoverCrore: z.number().nonnegative(),
  sector: z.string(),
  cluster: z.string(),
  tier: StorageTier,
  coachId: Id.optional(),
  zed: z.enum(['none', 'bronze', 'silver', 'gold']),
  isoCertified: z.boolean(),
  womenOwned: z.boolean(),
})
export type PlantProfile = z.infer<typeof PlantProfile>

/** Sutra Baseline: 25 questions, a recorded gemba walk and two weeks of existing records. */
export const Baseline = z.object({
  id: Id,
  siteId: Id,
  coachId: Id,
  startedAt: Timestamp,
  status: z.enum(['walking', 'draft', 'reviewed']),
  questionsAnswered: z.number().int().min(0).max(25),
  walkMedia: z.number().int().nonnegative(),
  recordDays: z.number().int().nonnegative(),
  dimensions: z.array(
    z.object({
      dimension: Dimension,
      level: Level,
      rationale: z.string().max(300),
      evidenceIds: z.array(Id),
      /** What evidence would lift this dimension one level. */
      nextGap: z.string().max(200),
    }),
  ),
  secondAssessorLevel: Level.optional(),
  reviewedAt: Timestamp.optional(),
})
export type Baseline = z.infer<typeof Baseline>

export const LeakKind = z.enum([
  'material_receipt',
  'first_off',
  'in_process',
  'problems',
  'handover',
  'final_inspection',
  'invoice',
])
export type LeakKind = z.infer<typeof LeakKind>

export const ProcessStep = z.object({
  id: z.string(),
  name: z.string(),
  owner: z.string(),
  checks: z.array(z.string()),
  leak: z
    .object({ kind: LeakKind, description: z.string(), skill: z.string().optional() })
    .optional(),
})

/** Current-state map drafted from walk media; the coach edits it into the future state. */
export const ProcessMap = z.object({
  id: Id,
  siteId: Id,
  state: z.enum(['current', 'future']),
  status: z.enum(['ai_draft', 'coach_edited', 'approved']),
  steps: z.array(ProcessStep),
  updatedAt: Timestamp,
  approvedBy: Id.optional(),
})
export type ProcessMap = z.infer<typeof ProcessMap>

export const ModelTier = z.enum(['flash_lite', 'flash', 'pro', 'none'])
export type ModelTier = z.infer<typeof ModelTier>

export const SkillKey = z.enum([
  'gauge_reader',
  'sheet_digitiser',
  'voice_to_event',
  'check_plan',
  'mtc_checker',
  'report_drafter',
  'shift_brief',
  'drift_explainer',
  'capa_drafter',
  'audit_mapper',
  'invoice_matcher',
  'ask_evidence',
  'scheme_finder',
])
export type SkillKey = z.infer<typeof SkillKey>

/** One micro-AI skill: one small job, one metric, can be switched off without breaking the flow. */
export const Skill = z.object({
  key: SkillKey,
  leak: LeakKind.optional(),
  tier: ModelTier,
  metric: z.string(),
  target: z.number(),
  unit: z.enum(['percent', 'hours', 'count']),
  unlocks: Level,
})
export type Skill = z.infer<typeof Skill>

export const PlantSkill = z.object({
  siteId: Id,
  skill: SkillKey,
  enabled: z.boolean(),
  enabledAt: Timestamp.optional(),
  /** Measured value of the skill's metric over the last 30 days, if any. */
  measured: z.number().optional(),
  runs30d: z.number().int().nonnegative(),
})
export type PlantSkill = z.infer<typeof PlantSkill>

export const AuditStandard = z.enum(['zed', 'iso9001', 'iatf16949'])
export type AuditStandard = z.infer<typeof AuditStandard>

export const AuditPack = z.object({
  id: Id,
  siteId: Id,
  standard: AuditStandard,
  builtAt: Timestamp,
  clauses: z.array(
    z.object({
      ref: z.string(),
      title: z.string(),
      evidenceIds: z.array(Id),
      /** An explicit gap is shown instead of invented evidence. */
      gap: z.string().optional(),
    }),
  ),
})
export type AuditPack = z.infer<typeof AuditPack>

/** What a buyer commits to grant at each level, agreed in writing before the pilot. */
export const RewardRule = z.object({
  buyerTenantId: Id,
  level: Level,
  reward: z.enum(['reduced_inspection', 'payment_terms', 'new_parts_rfq', 'supplier_of_year']),
  detail: z.string(),
})
export type RewardRule = z.infer<typeof RewardRule>

export const Scheme = z.object({
  id: z.string(),
  name: z.string(),
  body: z.string(),
  benefit: z.string(),
  requires: z.object({
    maxTurnoverCrore: z.number().optional(),
    zedAtLeast: z.enum(['none', 'bronze', 'silver', 'gold']).optional(),
    womenOwned: z.boolean().optional(),
  }),
  url: z.string(),
  verifiedOn: CalendarDate,
})
export type Scheme = z.infer<typeof Scheme>
