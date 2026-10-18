import { describe, expect, it } from 'vitest'
import { heatMatch, overallOf } from './rules'

describe('heatMatch', () => {
  it('passes identical heat numbers, ignoring case and spaces', () => {
    expect(heatMatch('h24-0971 ', 'H24-0971')).toBe('pass')
  })

  it('fails transposed digits', () => {
    expect(heatMatch('H24-0917', 'H24-0971')).toBe('fail')
  })

  it('fails when either side is missing', () => {
    expect(heatMatch(undefined, 'H24-0971')).toBe('fail')
  })
})

describe('overallOf', () => {
  const check = (result: 'pass' | 'warn' | 'fail') => ({
    rule: 'heat_match' as const,
    result,
    detail: '',
    evidenceIds: [],
  })

  it('takes the worst result', () => {
    expect(overallOf([check('pass'), check('warn')])).toBe('warn')
    expect(overallOf([check('warn'), check('fail')])).toBe('fail')
    expect(overallOf([check('pass')])).toBe('pass')
  })
})
