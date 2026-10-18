import type { MessageId } from './i18n'

export const LEVELS = [0, 1, 2, 3, 4, 5] as const

const NAMES = [
  'ladder.0.name',
  'ladder.1.name',
  'ladder.2.name',
  'ladder.3.name',
  'ladder.4.name',
  'ladder.5.name',
] as const satisfies readonly MessageId[]
const BODIES = [
  'ladder.0.body',
  'ladder.1.body',
  'ladder.2.body',
  'ladder.3.body',
  'ladder.4.body',
  'ladder.5.body',
] as const satisfies readonly MessageId[]

export function ladderName(level: number): MessageId {
  return NAMES[level] ?? NAMES[0]
}

export function ladderBody(level: number): MessageId {
  return BODIES[level] ?? BODIES[0]
}
