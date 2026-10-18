import { describe, expect, it } from 'vitest'
import { zonedDate, zonedInstant } from './time'

describe('zonedInstant', () => {
  it('converts plant wall-clock time to UTC', () => {
    expect(zonedInstant('2026-10-18', '06:00', 'Asia/Tokyo')).toBe('2026-10-17T21:00:00.000Z')
    expect(zonedInstant('2026-10-18', '06:30', 'Asia/Kolkata')).toBe('2026-10-18T01:00:00.000Z')
  })

  it('round-trips the calendar date', () => {
    expect(zonedDate('2026-10-17T21:00:00.000Z', 'Asia/Tokyo')).toBe('2026-10-18')
  })
})
