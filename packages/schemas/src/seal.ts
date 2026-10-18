import type { AuditEntry, Lot, Passport, QualityReport } from './trust'

/**
 * Canonical JSON: object keys sorted, no whitespace, `undefined` fields dropped.
 * Must stay byte-identical to `canonical_json` in services/agents; both are
 * tested against packages/schemas/fixtures/canonical.json.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  const entries = Object.entries(value)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`
}

/** SHA-256 as lowercase hex. Uses Web Crypto so it runs in the browser and on the server. */
export async function sha256Hex(text: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export const GENESIS_HASH = '0'.repeat(64)

/** The part of a report the seal covers: everything the buyer reads, nothing about the seal itself. */
export function reportSealPayload(report: QualityReport) {
  const { sealHash: _seal, auditSeq: _seq, ...payload } = report
  return payload
}

export function sealReport(report: QualityReport): Promise<string> {
  return sha256Hex(canonicalJson(reportSealPayload(report)))
}

export type AuditEntryBody = Omit<AuditEntry, 'prevHash' | 'hash'>

/** hash = sha256(prevHash + canonicalJSON(entry)) */
export function chainHash(prevHash: string, entry: AuditEntryBody): Promise<string> {
  return sha256Hex(prevHash + canonicalJson(entry))
}

/** The passport seal covers the lot identity, every rule result and the hash of every cited evidence item. */
export function passportSealPayload(
  lot: Pick<Lot, 'id' | 'lotNo' | 'poNumber' | 'partNo' | 'heatNo' | 'qty'>,
  passport: Pick<Passport, 'version' | 'checks' | 'overall'>,
  evidenceHashes: Record<string, string>,
) {
  return {
    lot,
    version: passport.version,
    overall: passport.overall,
    checks: passport.checks,
    evidenceHashes,
  }
}
