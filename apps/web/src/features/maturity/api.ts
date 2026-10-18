import { AnswerAssessmentInput, ReviewScoreInput } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { agentsConfigured, callAgent } from '@/lib/agents.server'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { appendAudit, db, evidenceRefs, must, now } from '@/lib/store.server'
import { maturityView } from './maturity.server'

export const getMaturity = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, ['supplier_owner'])
    const store = await db()
    const view = maturityView(store, siteOf(store, user).id)
    if (!view) throw new AppError('NOT_FOUND', 'assessment')
    return view
  })

export const reviewScore = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ReviewScoreInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['supplier_owner'])
    const store = await db()
    const site = siteOf(store, user)
    const score = must(
      store.scores.find(
        (s) =>
          s.assessmentId === data.assessmentId &&
          s.stageId === data.stageId &&
          s.dimension === data.dimension,
      ),
      'score',
    )
    if (!store.stages.some((s) => s.id === score.stageId && s.siteId === site.id))
      throw new AppError('FORBIDDEN', 'site')
    if (data.state === 'disputed' && !data.comment?.trim())
      throw new AppError('VALIDATION', 'comment required')
    score.state = data.state
    score.comment = data.comment?.trim() || undefined
    await appendAudit(store, {
      tenantId: site.tenantId,
      actorId: user.id,
      action: 'score.review',
      objectRef: `assessments/${score.assessmentId}/scores/${score.stageId}:${score.dimension}`,
      at: now(store),
    })
    return score
  })

export const getAssessment = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, ['supplier_owner'])
    const store = await db()
    const site = siteOf(store, user)
    const assessment = store.assessments
      .filter((a) => a.siteId === site.id)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
    if (!assessment) throw new AppError('NOT_FOUND', 'assessment')
    return {
      assessment,
      questionsAsked: assessment.transcript.filter((m) => m.role === 'auditor').length,
      evidence: evidenceRefs(
        store,
        assessment.transcript.flatMap((m) => m.evidenceIds),
      ),
      timeZone: site.timeZone,
    }
  })

/** Follow-up questions used when the auditor agent is not connected. */
const SCRIPTED = [
  'Who checks that the heat number on the coil tag matches the lot before the press run starts?',
  'When pitch drifts, how does the line decide whether to stop or to keep running with extra checks?',
  'Show one die-change record from this week with the stroke count written down.',
  'How often does the team review the out-of-limit readings together, and where is that recorded?',
]

export const answerAssessment = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(AnswerAssessmentInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['supplier_owner'])
    const store = await db()
    const site = siteOf(store, user)
    const assessment = must(
      store.assessments.find((a) => a.id === data.assessmentId && a.siteId === site.id),
      'assessment',
    )
    if (assessment.status !== 'in_progress') throw new AppError('CONFLICT', 'assessment closed')
    const at = now(store)
    assessment.transcript.push({
      role: 'owner',
      text: data.answer,
      evidenceIds: data.evidenceIds,
      at,
    })

    const asked = assessment.transcript.filter((m) => m.role === 'auditor').length
    const next = agentsConfigured()
      ? await callAgent(
          '/agents/maturity/turn',
          site.tenantId,
          { assessmentId: assessment.id, transcript: assessment.transcript },
          z.object({ question: z.string().nullable() }),
        )
      : { question: SCRIPTED[asked - 3] ?? null }

    if (next.question && asked < assessment.maxQuestions) {
      assessment.transcript.push({ role: 'auditor', text: next.question, evidenceIds: [], at })
    } else {
      assessment.status = 'scored'
    }
    return { status: assessment.status }
  })
