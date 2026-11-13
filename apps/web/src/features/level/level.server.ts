import { Dimension, plantLevel, promotionGaps, STREAK_DAYS, type Level } from '@sutraos/schemas'
import { maturityView } from '@/features/maturity/maturity.server'
import { activeConsent } from '@/lib/auth.server'
import { evidenceRefs, now, type Db } from '@/lib/store.server'

const DAY = 86_400_000

/**
 * A plant's Sutra level and what blocks the next one. Levels come from the
 * reviewed baseline, or from stage scores where a full assessment exists;
 * promotion also needs an evidence streak (rules in packages/schemas).
 */
export function levelView(store: Db, siteId: string) {
  const site = store.sites.find((s) => s.id === siteId)
  if (!site) return null
  const at = now(store)
  const profile = store.plantProfiles.find((p) => p.siteId === siteId)
  const baseline = store.baselines
    .filter((b) => b.siteId === siteId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
  const maturity = maturityView(store, siteId)

  const dimensions = Dimension.options.map((dimension) => {
    const fromBaseline = baseline?.dimensions.find((d) => d.dimension === dimension)
    const stageCells =
      maturity?.stages.flatMap((s) => s.cells.filter((c) => c.dimension === dimension)) ?? []
    const level =
      fromBaseline?.level ?? (stageCells.length ? Math.min(...stageCells.map((c) => c.level)) : 0)
    return {
      dimension,
      level,
      rationale: fromBaseline?.rationale ?? stageCells[0]?.rationale ?? '',
      nextGap: fromBaseline?.nextGap ?? '',
      evidenceIds:
        fromBaseline?.evidenceIds ?? stageCells.flatMap((c) => c.evidenceIds).slice(0, 3),
    }
  })

  const stageLevels = maturity
    ? Object.fromEntries(maturity.stages.map((s) => [s.id, s.level]))
    : Object.fromEntries(
        store.stages
          .filter((s) => s.siteId === siteId)
          .map((s) => [s.id, Math.min(...dimensions.map((d) => d.level))]),
      )
  const level = plantLevel(stageLevels, Object.keys(stageLevels)) as Level
  const next = Math.min(5, level + 1) as Level

  const since =
    baseline?.reviewedAt ??
    store.reports.find((r) => r.siteId === siteId && r.approvedAt)?.approvedAt ??
    at
  const card = store.scorecards.find((c) => c.tenantId === site.tenantId)
  const streak = {
    days: Math.max(0, Math.floor((Date.parse(at) - Date.parse(since)) / DAY)),
    adherence: card?.checklistAdherence30d ?? 0,
    buyerVerified: store.audit.some(
      (a) => a.tenantId === site.tenantId && a.action === 'buyer.view',
    ),
  }

  const rewards = store.rewardRules
    .filter((r) => activeConsent(store, site.tenantId, r.buyerTenantId))
    .map((r) => ({
      ...r,
      buyerName: store.tenants.find((t) => t.id === r.buyerTenantId)?.name ?? '',
      unlocked: level >= r.level,
    }))

  return {
    siteName: site.name,
    timeZone: site.timeZone,
    tier: profile?.tier ?? 't2_core',
    level,
    next,
    dimensions,
    blocking: dimensions.filter((d) => d.level < next),
    streak,
    streakNeeded: STREAK_DAYS[next] ?? 0,
    promotionGaps: promotionGaps(next, streak),
    rewards,
    baseline: baseline
      ? {
          reviewedAt: baseline.reviewedAt,
          secondAssessorLevel: baseline.secondAssessorLevel,
          status: baseline.status,
        }
      : null,
    evidence: evidenceRefs(
      store,
      dimensions.flatMap((d) => d.evidenceIds),
    ),
  }
}
