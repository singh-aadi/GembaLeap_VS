import {
  canonicalJson,
  chainHash,
  GENESIS_HASH,
  passportSealPayload,
  sealReport,
  sha256Hex,
  type AuditEntry,
  type AuditEntryBody,
  type Lot,
  type Passport,
} from '@gembaleap/schemas'
import { buildSeed, type Seed } from '@gembaleap/seed'
import { AppError } from './app-error'
import type { EvidenceRef } from './evidence-ref'

/**
 * In-memory data store seeded with synthetic data. It is the seam where the
 * Firestore access layer goes (M0): feature handlers only use `db()` and the
 * helpers below, never the seed directly.
 */
export type EvidenceRequest = {
  id: string
  buyerTenantId: string
  supplierTenantId: string
  requestedBy: string
  at: string
}
export type Db = Omit<Seed, 'auditLog'> & {
  audit: AuditEntry[]
  evidenceRequests: EvidenceRequest[]
}

let dbPromise: Promise<Db> | undefined
const startedAt = Date.now()

export function db(): Promise<Db> {
  dbPromise ??= init()
  return dbPromise
}

/** Demo clock: starts at the seed's fixed time and advances in real time. */
export function now(store: Db): string {
  return new Date(Date.parse(store.now) + (Date.now() - startedAt)).toISOString()
}

async function init(): Promise<Db> {
  const { auditLog, ...seed } = buildSeed()
  const store: Db = { ...seed, audit: [], evidenceRequests: [] }
  for (const { seq: _seq, ...entry } of auditLog) await appendAudit(store, entry)

  for (const report of store.reports) {
    if (report.status !== 'published') continue
    report.sealHash = await sealReport(report)
    report.auditSeq = store.audit.find(
      (a) => a.action === 'report.publish' && a.objectRef === `reports/${report.id}`,
    )?.seq
  }
  for (const passport of store.passports) {
    if (passport.status !== 'sealed') continue
    passport.sealedHash = await passportHash(store, passport)
  }
  return store
}

export async function appendAudit(
  store: Db,
  entry: Omit<AuditEntryBody, 'seq'>,
): Promise<AuditEntry> {
  const prev = store.audit.at(-1)
  const body: AuditEntryBody = { ...entry, seq: (prev?.seq ?? 0) + 1 }
  const prevHash = prev?.hash ?? GENESIS_HASH
  const appended: AuditEntry = { ...body, prevHash, hash: await chainHash(prevHash, body) }
  store.audit.push(appended)
  return appended
}

/** Re-computes every link of the chain. Used by the buyer-side verify action. */
export async function verifyAuditChain(store: Db): Promise<boolean> {
  let prevHash = GENESIS_HASH
  for (const { prevHash: linked, hash, ...body } of store.audit) {
    if (linked !== prevHash || hash !== (await chainHash(prevHash, body))) return false
    prevHash = hash
  }
  return true
}

export async function passportHash(store: Db, passport: Passport): Promise<string> {
  const lot = must(
    store.lots.find((l) => l.id === passport.lotId),
    'lot',
  )
  const cited = new Set(passport.checks.flatMap((c) => c.evidenceIds))
  const evidenceHashes = Object.fromEntries(
    store.evidence.filter((e) => cited.has(e.id)).map((e) => [e.id, e.sha256]),
  )
  return sha256Hex(canonicalJson(passportSealPayload(pickLot(lot), passport, evidenceHashes)))
}

function pickLot({ id, lotNo, poNumber, partNo, heatNo, qty }: Lot) {
  return { id, lotNo, poNumber, partNo, heatNo, qty }
}

export function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new AppError('NOT_FOUND', what)
  return value
}

export function evidenceRefs(store: Db, ids: readonly string[]): Record<string, EvidenceRef> {
  const refs: Record<string, EvidenceRef> = {}
  for (const refId of new Set(ids)) {
    const item = store.evidence.find((e) => e.id === refId)
    if (item) {
      refs[refId] = {
        id: refId,
        kind: item.kind,
        caption: item.caption ?? item.kind,
        at: item.createdAt,
        sha256: item.sha256,
        tenantId: item.tenantId,
      }
      continue
    }
    const event = store.events.find((e) => e.id === refId)
    if (event) {
      refs[refId] = {
        id: refId,
        kind: 'event',
        caption: event.summaryEn,
        at: event.createdAt,
        tenantId: event.tenantId,
      }
    }
  }
  return refs
}

export function newId(): string {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  let time = Date.now()
  let timePart = ''
  for (let i = 0; i < 10; i++) {
    timePart = alphabet[time % 32] + timePart
    time = Math.floor(time / 32)
  }
  const random = crypto.getRandomValues(new Uint8Array(16))
  return timePart + Array.from(random, (b) => alphabet[b % 32]).join('')
}
