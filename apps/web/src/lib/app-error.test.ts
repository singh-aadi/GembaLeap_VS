import { describe, expect, it } from 'vitest'
import { AppError } from './app-error'

describe('AppError', () => {
  it('carries its code through the message', () => {
    expect(AppError.codeOf(new Error(new AppError('NO_CONSENT', 'reports').message))).toBe(
      'NO_CONSENT',
    )
  })

  it('maps anything else to UNKNOWN', () => {
    expect(AppError.codeOf(new Error('boom'))).toBe('UNKNOWN')
    expect(AppError.codeOf('nope')).toBe('UNKNOWN')
  })
})
