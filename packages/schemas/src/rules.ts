import type { Level, ModelTier, PlantProfile, Scheme } from './index'

/**
 * Deterministic Sutra rules. Mirrored in services/agents/sutra_agents/levels.py and
 * payments.py; both sides are tested against packages/schemas/fixtures.
 */

const ZED_ORDER = ['none', 'bronze', 'silver', 'gold'] as const

/** plant_level = min over critical stages of stage_level. No critical stages means L0. */
export function plantLevel(
  stageLevels: Record<string, number>,
  criticalStageIds: readonly string[],
): number {
  const levels = criticalStageIds.map((id) => stageLevels[id] ?? 0)
  return levels.length === 0 ? 0 : Math.min(...levels)
}

export type Streak = { days: number; adherence: number; buyerVerified: boolean }

/** What promotion to `target` still needs. Empty means the level can be granted. */
export function promotionGaps(
  target: Level,
  streak: Streak,
): Array<'streak_days' | 'adherence' | 'buyer_verification'> {
  const gaps: Array<'streak_days' | 'adherence' | 'buyer_verification'> = []
  if (target >= 2 && streak.days < (target >= 3 ? 90 : 30)) gaps.push('streak_days')
  if (target >= 3 && streak.adherence < 0.95) gaps.push('adherence')
  if (target >= 3 && !streak.buyerVerified) gaps.push('buyer_verification')
  return gaps
}

export const STREAK_DAYS: Record<number, number> = { 2: 30, 3: 90, 4: 90, 5: 90 }

/** MSMED Act: buyers must pay MSME invoices within 45 days of acceptance. */
export const MSMED_LIMIT_DAYS = 45

export function paymentClock(
  issuedAt: string,
  paidAt: string | undefined,
  now: string,
  termDays = MSMED_LIMIT_DAYS,
) {
  const end = Date.parse(paidAt ?? now)
  const day = Math.floor((end - Date.parse(issuedAt)) / 86_400_000)
  const limit = Math.min(termDays, MSMED_LIMIT_DAYS)
  const status = paidAt
    ? day <= limit
      ? 'paid_on_time'
      : 'paid_late'
    : day > limit
      ? 'overdue'
      : day > limit - 7
        ? 'due_soon'
        : 'open'
  return { day, limit, status } as const
}

/** Model escalation: cheapest tier first; move up only when a rule says the task needs it. */
export function chooseTier(
  base: ModelTier,
  opts: { confidence?: number; inputChars?: number },
): ModelTier {
  if (base === 'none' || base === 'pro') return base
  const needsMore = (opts.confidence ?? 1) < 0.8 || (opts.inputChars ?? 0) > 8_000
  if (!needsMore) return base
  return base === 'flash_lite' ? 'flash' : 'pro'
}

/** Scheme finder: eligibility is computed in code and every reason is shown. */
export function schemeEligibility(scheme: Scheme, plant: PlantProfile) {
  const reasons: Array<{ ok: boolean; rule: string }> = []
  const r = scheme.requires
  if (r.maxTurnoverCrore !== undefined)
    reasons.push({
      ok: plant.turnoverCrore <= r.maxTurnoverCrore,
      rule: `turnover ≤ ₹${r.maxTurnoverCrore} crore`,
    })
  if (r.zedAtLeast)
    reasons.push({
      ok: ZED_ORDER.indexOf(plant.zed) >= ZED_ORDER.indexOf(r.zedAtLeast),
      rule: `ZED ${r.zedAtLeast} or above`,
    })
  if (r.womenOwned) reasons.push({ ok: plant.womenOwned, rule: 'women-owned enterprise' })
  return { eligible: reasons.every((x) => x.ok), reasons }
}

/** Three-way match: PO, goods receipt and invoice must agree on quantity and price within tolerance. */
export function invoiceMatch(
  po: { qty: number; unitPrice: number },
  grn: { qtyAccepted: number },
  invoice: { qty: number; unitPrice: number },
  priceTolerance = 0.005,
) {
  const issues: Array<'qty_exceeds_grn' | 'qty_exceeds_po' | 'price_mismatch'> = []
  if (invoice.qty > grn.qtyAccepted) issues.push('qty_exceeds_grn')
  if (invoice.qty > po.qty) issues.push('qty_exceeds_po')
  if (Math.abs(invoice.unitPrice - po.unitPrice) > po.unitPrice * priceTolerance)
    issues.push('price_mismatch')
  return { matched: issues.length === 0, issues }
}
