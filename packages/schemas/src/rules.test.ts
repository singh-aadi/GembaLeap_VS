import { describe, expect, it } from 'vitest'
import { chooseTier, invoiceMatch, paymentClock, plantLevel, promotionGaps } from './rules'

describe('plantLevel', () => {
  it('is the weakest critical stage', () => {
    expect(plantLevel({ a: 2, b: 1, c: 3 }, ['a', 'b'])).toBe(1)
    expect(plantLevel({ a: 2 }, [])).toBe(0)
  })
})

describe('promotionGaps', () => {
  it('needs a 90-day verified streak at 95% for L3', () => {
    expect(promotionGaps(3, { days: 91, adherence: 0.96, buyerVerified: true })).toEqual([])
    expect(promotionGaps(3, { days: 40, adherence: 0.9, buyerVerified: false })).toEqual([
      'streak_days',
      'adherence',
      'buyer_verification',
    ])
    expect(promotionGaps(2, { days: 30, adherence: 0.5, buyerVerified: false })).toEqual([])
  })
})

describe('paymentClock', () => {
  it('flags invoices past the 45-day MSMED limit', () => {
    expect(paymentClock('2026-08-01T00:00:00Z', undefined, '2026-10-13T00:00:00Z').status).toBe(
      'overdue',
    )
    expect(
      paymentClock('2026-10-01T00:00:00Z', '2026-11-10T00:00:00Z', '2026-11-13T00:00:00Z'),
    ).toEqual({ day: 40, limit: 45, status: 'paid_on_time' })
  })
})

describe('chooseTier', () => {
  it('escalates only on low confidence or long input', () => {
    expect(chooseTier('flash_lite', { confidence: 0.95 })).toBe('flash_lite')
    expect(chooseTier('flash_lite', { confidence: 0.6 })).toBe('flash')
    expect(chooseTier('flash', { inputChars: 20_000 })).toBe('pro')
  })
})

describe('invoiceMatch', () => {
  it('catches quantity and price mismatches', () => {
    expect(
      invoiceMatch({ qty: 100, unitPrice: 50 }, { qtyAccepted: 98 }, { qty: 100, unitPrice: 52 })
        .issues,
    ).toEqual(['qty_exceeds_grn', 'price_mismatch'])
  })
})
