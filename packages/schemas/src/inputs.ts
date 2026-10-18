import { z } from 'zod'
import { Dimension, EventType, Id } from './primitives'
import { Sector } from './tenant'

/** Inputs of server functions that do not create a whole entity. */
export const ById = z.object({ id: Id })

export const EventFilters = z.object({
  stage: Id.optional(),
  type: EventType.optional(),
  status: z.enum(['draft', 'confirmed']).optional(),
  sort: z.enum(['time', 'severity']).default('time'),
})
export type EventFilters = z.infer<typeof EventFilters>

export const ConfirmEventInput = z.object({
  eventId: Id,
  codes: z
    .array(z.string().regex(/^[A-Z]{1,3}-[A-Z0-9-]+$/))
    .min(1)
    .max(5)
    .optional(),
  stageId: Id.optional(),
})

export const AnswerAssessmentInput = z.object({
  assessmentId: Id,
  answer: z.string().trim().min(1).max(2000),
  evidenceIds: z.array(Id).max(5).default([]),
})

export const HeatmapFilters = z.object({
  sector: Sector.optional(),
  drift: z.enum(['improving', 'stable', 'drifting']).optional(),
  sort: z.enum(['risk', 'ladder', 'adherence', 'name']).default('risk'),
  view: z.enum(['table', 'grid']).default('table'),
})
export type HeatmapFilters = z.infer<typeof HeatmapFilters>

export const SourcingFilters = z.object({
  process: z.string().optional(),
  minLadder: z.coerce.number().int().min(0).max(5).optional(),
})

export const NcrMessageInput = z.object({ ncrId: Id, text: z.string().trim().min(1).max(1000) })

export const RaiseNcrInput = z.object({
  lotId: Id,
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(1000),
})

export const FixHeatInput = z.object({
  lotId: Id,
  certificateHeatNo: z
    .string()
    .trim()
    .regex(/^[A-Z0-9-]{4,20}$/),
  evidence: z.object({ storagePath: z.string(), sha256: z.string().regex(/^[a-f0-9]{64}$/) }),
})

export const CloseCycleInput = z.object({
  cycleId: Id,
  resultValue: z.number().nonnegative(),
  evidence: z
    .array(z.object({ storagePath: z.string(), sha256: z.string().regex(/^[a-f0-9]{64}$/) }))
    .min(1),
})

export const TierDecisionInput = z.object({
  supplierTenantId: Id,
  tier: z.enum(['tightened', 'normal', 'reduced']),
})

export const ScoreKey = z.object({ assessmentId: Id, stageId: Id, dimension: Dimension })
