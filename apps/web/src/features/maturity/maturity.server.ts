import { Dimension, type Level } from '@gembaleap/schemas'
import { evidenceRefs, type Db } from '@/lib/store.server'

/** Latest scored assessment for a site: stage × dimension grid plus each stage's level. */
export function maturityView(store: Db, siteId: string) {
  const site = store.sites.find((s) => s.id === siteId)
  const assessment = store.assessments
    .filter((a) => a.siteId === siteId && a.status === 'scored')
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
  if (!site || !assessment) return null
  const scores = store.scores.filter((s) => s.assessmentId === assessment.id)
  const stages = store.stages
    .filter((s) => s.siteId === siteId)
    .sort((a, b) => a.order - b.order)
    .map((stage) => {
      const cells = Dimension.options.map((dimension) =>
        scores.find((s) => s.stageId === stage.id && s.dimension === dimension),
      )
      // A stage reaches a level only when every dimension does.
      const level = Math.min(...cells.map((c) => c?.level ?? 0)) as Level
      return { id: stage.id, name: stage.name, level, cells: cells.flatMap((c) => (c ? [c] : [])) }
    })
  return {
    assessmentId: assessment.id,
    assessedAt: assessment.startedAt,
    ladderLevel: site.ladderLevel,
    siteIndex: site.siteIndex,
    timeZone: site.timeZone,
    stages,
    counts: {
      total: scores.length,
      accepted: scores.filter((s) => s.state === 'accepted').length,
      disputed: scores.filter((s) => s.state === 'disputed').length,
      draft: scores.filter((s) => s.state === 'draft').length,
    },
    evidence: evidenceRefs(
      store,
      scores.flatMap((s) => s.evidenceIds),
    ),
  }
}
