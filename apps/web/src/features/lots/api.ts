import { ById, FixHeatInput, type Lot, type User } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireConsent, requireRole, requireTenantAccess } from '@/lib/auth.server'
import {
  appendAudit,
  db,
  evidenceRefs,
  must,
  newId,
  now,
  passportHash,
  type Db,
} from '@/lib/store.server'
import { heatMatch, overallOf } from './rules'

const SUPPLIER_SIDE = ['supplier_owner', 'supplier_quality'] as const

export const listLots = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, SUPPLIER_SIDE)
    const store = await db()
    return store.lots
      .filter((l) => l.tenantId === user.tenantId)
      .sort((a, b) => b.producedAt.localeCompare(a.producedAt))
      .map((lot) => {
        const passport = store.passports.find((p) => p.lotId === lot.id)
        return {
          ...lot,
          buyerName: store.tenants.find((t) => t.id === lot.buyerTenantId)?.name ?? '',
          passportStatus: passport?.status ?? 'building',
          overall: passport?.overall ?? 'warn',
        }
      })
  })

/** Buyers see a passport only once sealed and only while consent for passports is live. */
function readableLot(store: Db, user: User, lotId: string): Lot {
  const lot = must(
    store.lots.find((l) => l.id === lotId),
    'lot',
  )
  if (user.tenantId === lot.tenantId) {
    requireRole(user, SUPPLIER_SIDE)
    return lot
  }
  requireRole(user, ['buyer_quality'])
  if (lot.buyerTenantId !== user.tenantId) throw new AppError('FORBIDDEN', 'lot')
  requireConsent(store, user, lot.tenantId, 'passports')
  if (store.passports.find((p) => p.lotId === lot.id)?.status !== 'sealed')
    throw new AppError('NOT_FOUND', 'passport')
  return lot
}

export const getLot = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    const store = await db()
    const lot = readableLot(store, user, data.id)
    const passport = must(
      store.passports.find((p) => p.lotId === lot.id),
      'passport',
    )
    const viewRef = `lots/${lot.id}/passport`
    if (
      user.tenantId !== lot.tenantId &&
      !store.audit.some(
        (a) => a.action === 'buyer.view' && a.actorId === user.id && a.objectRef === viewRef,
      )
    ) {
      await appendAudit(store, {
        tenantId: lot.tenantId,
        actorId: user.id,
        action: 'buyer.view',
        objectRef: viewRef,
        at: now(store),
      })
    }
    return {
      lot,
      passport,
      supplierName: store.tenants.find((t) => t.id === lot.tenantId)?.name ?? '',
      buyerName: store.tenants.find((t) => t.id === lot.buyerTenantId)?.name ?? '',
      sealedByName: store.users.find((u) => u.id === passport.sealedBy)?.name,
      ncrs: store.ncrs
        .filter((n) => n.lotId === lot.id)
        .map((n) => ({ id: n.id, number: n.number, status: n.status })),
      evidence: evidenceRefs(
        store,
        passport.checks.flatMap((c) => c.evidenceIds),
      ),
      timeZone: store.sites.find((s) => s.id === lot.siteId)?.timeZone ?? 'UTC',
    }
  })

/** Attach a corrected certificate and re-run the heat-number rule. */
export const fixHeatNumber = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(FixHeatInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_SIDE)
    const store = await db()
    const lot = must(
      store.lots.find((l) => l.id === data.lotId),
      'lot',
    )
    requireTenantAccess(user, lot.tenantId)
    const passport = must(
      store.passports.find((p) => p.lotId === lot.id),
      'passport',
    )
    if (passport.status === 'sealed') throw new AppError('CONFLICT', 'sealed')

    const at = now(store)
    const evidenceId = newId()
    store.evidence.push({
      id: evidenceId,
      tenantId: lot.tenantId,
      siteId: lot.siteId,
      kind: 'scan',
      storagePath: data.evidence.storagePath,
      sha256: data.evidence.sha256,
      caption: `Material certificate, heat ${data.certificateHeatNo}`,
      extracted: { heatNo: data.certificateHeatNo },
      createdBy: user.id,
      createdAt: at,
    })
    const result = heatMatch(data.certificateHeatNo, lot.heatNo)
    const lineEvidence =
      passport.checks.find((c) => c.rule === 'heat_match')?.evidenceIds.slice(1) ?? []
    passport.checks = passport.checks.map((c) =>
      c.rule === 'heat_match'
        ? {
            rule: 'heat_match',
            result,
            detail: `Certificate heat ${data.certificateHeatNo} ${result === 'pass' ? 'matches' : 'does not match'} line capture ${lot.heatNo ?? '—'}.`,
            evidenceIds: [evidenceId, ...lineEvidence],
          }
        : c,
    )
    passport.overall = overallOf(passport.checks)
    passport.status = passport.overall === 'fail' ? 'needs_fix' : 'ready'
    passport.version += 1
    return { result }
  })

export const sealPassport = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_SIDE)
    const store = await db()
    const lot = must(
      store.lots.find((l) => l.id === data.id),
      'lot',
    )
    requireTenantAccess(user, lot.tenantId)
    const passport = must(
      store.passports.find((p) => p.lotId === lot.id),
      'passport',
    )
    if (passport.status !== 'ready') throw new AppError('CONFLICT', passport.status)
    const at = now(store)
    passport.status = 'sealed'
    passport.sealedAt = at
    passport.sealedBy = user.id
    passport.sealedHash = await passportHash(store, passport)
    await appendAudit(store, {
      tenantId: lot.tenantId,
      actorId: user.id,
      action: 'passport.seal',
      objectRef: `lots/${lot.id}/passport`,
      at,
    })
    return { sealedHash: passport.sealedHash }
  })
