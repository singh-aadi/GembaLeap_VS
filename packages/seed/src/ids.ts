import { createHash } from 'node:crypto'

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const TIME_PART = '01JA0Q8M00' // fixed: seed ids only need to be valid and stable

/** Stable ULID derived from a readable key, so fixtures can reference each other by name. */
export function id(key: string): string {
  const bytes = createHash('sha256').update(key).digest()
  let random = ''
  for (let i = 0; i < 16; i++) random += CROCKFORD[(bytes[i] ?? 0) % 32]
  return TIME_PART + random
}

/** Stand-in digest for synthetic media that has no file behind it. */
export function fakeSha256(key: string): string {
  return createHash('sha256').update(`synthetic-media:${key}`).digest('hex')
}
