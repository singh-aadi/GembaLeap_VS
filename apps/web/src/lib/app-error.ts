export const ERROR_CODES = [
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NO_CONSENT',
  'NOT_FOUND',
  'VALIDATION',
  'CONFLICT',
  'AGENT_UNAVAILABLE',
  'AUTH_NOT_CONFIGURED',
  'UNKNOWN',
] as const
export type ErrorCode = (typeof ERROR_CODES)[number]

/**
 * Errors thrown from server functions. The code travels in the message as
 * "[CODE] detail" because only the message survives serialisation.
 */
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    detail = '',
  ) {
    super(`[${code}] ${detail}`.trim())
    this.name = 'AppError'
  }

  static codeOf(error: unknown): ErrorCode {
    const message = error instanceof Error ? error.message : ''
    const match = /^\[([A-Z_]+)\]/.exec(message)
    const code = ERROR_CODES.find((c) => c === match?.[1])
    return code ?? 'UNKNOWN'
  }
}
