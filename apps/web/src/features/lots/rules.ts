import type { Passport, PassportCheck } from '@gembaleap/schemas'

/**
 * Deterministic passport rules. The model only extracts values from documents;
 * comparisons happen here so the same inputs always give the same result.
 */
export function heatMatch(
  certificateHeat: string | undefined,
  lineHeat: string | undefined,
): PassportCheck['result'] {
  if (!certificateHeat || !lineHeat) return 'fail'
  return normalise(certificateHeat) === normalise(lineHeat) ? 'pass' : 'fail'
}

function normalise(heat: string) {
  return heat.trim().toUpperCase().replace(/\s+/g, '')
}

export function overallOf(checks: PassportCheck[]): Passport['overall'] {
  if (checks.some((c) => c.result === 'fail')) return 'fail'
  if (checks.some((c) => c.result === 'warn')) return 'warn'
  return 'pass'
}
