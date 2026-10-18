import { z } from 'zod'
import { Claim, Dimension, Id, Level, Timestamp } from './primitives'

export const Assessment = z.object({
  id: Id,
  siteId: Id,
  startedAt: Timestamp,
  status: z.enum(['in_progress', 'scored']),
  maxQuestions: z.literal(25),
  transcript: z.array(
    z.object({
      role: z.enum(['auditor', 'owner']),
      text: z.string(),
      evidenceIds: z.array(Id).default([]),
      at: Timestamp,
    }),
  ),
})
export type Assessment = z.infer<typeof Assessment>

export const ScoreState = z.enum(['draft', 'accepted', 'disputed'])
export type ScoreState = z.infer<typeof ScoreState>

export const StageScore = z.object({
  assessmentId: Id,
  stageId: Id,
  dimension: Dimension,
  level: Level,
  rationale: z.string().max(300),
  evidenceIds: z.array(Id).min(1),
  state: ScoreState,
  comment: z.string().optional(),
})
export type StageScore = z.infer<typeof StageScore>

export const ReviewScoreInput = z.object({
  assessmentId: Id,
  stageId: Id,
  dimension: Dimension,
  state: z.enum(['accepted', 'disputed']),
  comment: z.string().max(400).optional(),
})

export const BottleneckFactor = z.enum([
  'equipment_failure',
  'material_flow',
  'material_unavailability',
  'communication',
  'operations',
  'market_demand',
])
export type BottleneckFactor = z.infer<typeof BottleneckFactor>

/** Factor loadings from Ongbali et al. (2021). Used by the deterministic ranking, never by a model. */
export const FACTOR_LOADING: Record<BottleneckFactor, number> = {
  equipment_failure: 0.832,
  material_flow: 0.834,
  material_unavailability: 0.811,
  communication: 0.802,
  operations: 0.78,
  market_demand: 0.739,
}

export const Bottleneck = z.object({
  id: Id,
  siteId: Id,
  stageId: Id,
  title: z.string(),
  codes: z.array(z.string()),
  factor: BottleneckFactor,
  lossMinutes30d: z.number().nonnegative(),
  recurrence: z.number().int().nonnegative(),
  effort: z.number().int().min(1).max(5),
  priority: z.number(),
  rank: z.number().int().min(1),
  cycleId: Id.optional(),
})
export type Bottleneck = z.infer<typeof Bottleneck>

export const ImprovementCycle = z.object({
  id: Id,
  siteId: Id,
  bottleneckId: Id,
  stageId: Id,
  title: z.string(),
  fromLevel: Level,
  targetLevel: Level,
  plan: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      owner: z.string(),
      dueAt: Timestamp,
      done: z.boolean(),
    }),
  ),
  openedAt: Timestamp,
  dueAt: Timestamp,
  fixAppliedAt: Timestamp.optional(),
  status: z.enum(['open', 'verifying', 'closed']),
  baseline: z.object({ metric: z.string(), value: z.number(), unit: z.string() }),
  result: z.object({ value: z.number() }).optional(),
  beforeEvidenceIds: z.array(Id),
  verificationEvidenceIds: z.array(Id),
  closedAt: Timestamp.optional(),
})
export type ImprovementCycle = z.infer<typeof ImprovementCycle>

export const ShiftBrief = z.object({
  id: Id,
  siteId: Id,
  shift: z.enum(['A', 'B', 'C']),
  shiftStart: Timestamp,
  shiftEnd: Timestamp,
  generatedAt: Timestamp,
  happened: z.array(Claim),
  watch: z.array(Claim),
  pareto: z.array(z.object({ label: z.string(), minutes: z.number().nonnegative() })),
  checks: z.object({ done: z.number().int(), due: z.number().int(), outOfLimit: z.number().int() }),
  /** The incoming lead confirms they read it at handover. */
  acknowledgedBy: Id.optional(),
  acknowledgedAt: Timestamp.optional(),
})
export type ShiftBrief = z.infer<typeof ShiftBrief>
