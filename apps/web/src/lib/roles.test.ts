import { describe, expect, it } from 'vitest'
import { mobileTabsFor, navFor } from './nav'
import { canOpen, homeOf, sideOf } from './roles'

describe('role access', () => {
  it('sends each role to its own side', () => {
    expect(sideOf('line_lead')).toBe('supplier')
    expect(homeOf('buyer_procurement')).toBe('/b/suppliers')
  })

  it('keeps sharing and maturity with the owner', () => {
    expect(canOpen('supplier_owner', '/s/sharing')).toBe(true)
    expect(canOpen('supplier_quality', '/s/sharing')).toBe(false)
    expect(canOpen('line_lead', '/s/maturity')).toBe(false)
  })

  it('keeps procurement out of NCRs and passports', () => {
    expect(canOpen('buyer_procurement', '/b/ncr')).toBe(false)
    expect(canOpen('buyer_procurement', '/b/passports')).toBe(false)
  })
})

describe('navigation', () => {
  it('only lists sections the role can open', () => {
    const items = navFor('line_lead', 'supplier').flatMap((g) => g.items.map((i) => i.to))
    expect(items).toEqual(['/s/home', '/s/checklist', '/s/capture', '/s/events', '/s/shift-brief'])
  })

  it('caps phone tabs at five and moves the rest under More', () => {
    for (const role of [
      'supplier_owner',
      'line_lead',
      'supplier_quality',
      'buyer_quality',
      'buyer_procurement',
    ] as const) {
      const side = sideOf(role)
      const { tabs, overflow } = mobileTabsFor(role, side)
      expect(tabs.length + (overflow.length > 0 ? 1 : 0)).toBeLessThanOrEqual(5)
    }
  })
})
