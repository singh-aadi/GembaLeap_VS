import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { canonicalJson, chainHash, GENESIS_HASH, sha256Hex } from './seal'

const fixture = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'fixtures', 'canonical.json'), 'utf8'),
) as {
  input: unknown
  canonical: string
  sha256: string
}

describe('canonicalJson', () => {
  it('sorts keys at every depth and drops undefined', () => {
    expect(canonicalJson({ b: 1, a: { d: [3, { z: 1, y: 2 }], c: undefined } })).toBe(
      '{"a":{"d":[3,{"y":2,"z":1}]},"b":1}',
    )
  })

  it('matches the cross-language fixture', async () => {
    expect(canonicalJson(fixture.input)).toBe(fixture.canonical)
    expect(await sha256Hex(fixture.canonical)).toBe(fixture.sha256)
  })
})

describe('chainHash', () => {
  it('changes when any field of the entry changes', async () => {
    const entry = {
      seq: 1,
      tenantId: '01JA0000000000000000000001',
      actorId: '01JA0000000000000000000002',
      action: 'report.publish' as const,
      objectRef: 'reports/01JA0000000000000000000003',
      at: '2026-10-18T05:00:00.000Z',
    }
    const a = await chainHash(GENESIS_HASH, entry)
    const b = await chainHash(GENESIS_HASH, { ...entry, seq: 2 })
    expect(a).toMatch(/^[a-f0-9]{64}$/)
    expect(a).not.toBe(b)
  })
})
