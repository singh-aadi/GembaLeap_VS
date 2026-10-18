import { ById, GrantConsentInput } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole, requireTenantAccess } from '@/lib/auth.server'
import { appendAudit, db, must, newId, now } from '@/lib/store.server'

const OWNER = ['supplier_owner'] as const

export const getSharing = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, OWNER)
    const store = await db()
    const at = now(store)
    const tenant = must(
      store.tenants.find((t) => t.id === user.tenantId),
      'tenant',
    )
    const nameOf = (id: string) =>
      store.tenants.find((t) => t.id === id)?.name ??
      store.users.find((u) => u.id === id)?.name ??
      ''
    const consents = store.consents
      .filter((c) => c.supplierTenantId === tenant.id)
      .map((c) => ({
        ...c,
        buyerName: nameOf(c.buyerTenantId),
        active: !c.revokedAt && c.expiresAt > at,
      }))
      .sort((a, b) => Number(b.active) - Number(a.active) || b.createdAt.localeCompare(a.createdAt))
    const log = store.audit
      .filter(
        (a) =>
          a.tenantId === tenant.id &&
          [
            'buyer.view',
            'consent.grant',
            'consent.revoke',
            'report.publish',
            'passport.seal',
          ].includes(a.action),
      )
      .slice(-12)
      .reverse()
      .map((a) => ({
        seq: a.seq,
        action: a.action,
        actor: nameOf(a.actorId),
        objectRef: a.objectRef,
        at: a.at,
        hash: a.hash,
      }))
    return {
      consents,
      buyers: store.tenants
        .filter((t) => t.kind === 'buyer')
        .map((t) => ({ id: t.id, name: t.name })),
      openProfile: tenant.openProfile,
      log,
      timeZone: store.sites.find((s) => s.tenantId === tenant.id)?.timeZone ?? 'UTC',
    }
  })

export const grantConsent = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(GrantConsentInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, OWNER)
    const store = await db()
    const buyer = must(
      store.tenants.find((t) => t.id === data.buyerTenantId && t.kind === 'buyer'),
      'buyer',
    )
    const at = now(store)
    const expiresAt = `${data.expiresAt}T23:59:59.000Z`
    if (expiresAt <= at) throw new AppError('VALIDATION', 'expiry in the past')
    for (const existing of store.consents) {
      if (
        existing.supplierTenantId === user.tenantId &&
        existing.buyerTenantId === buyer.id &&
        !existing.revokedAt
      )
        existing.revokedAt = at
    }
    const consent = {
      id: newId(),
      supplierTenantId: user.tenantId,
      buyerTenantId: buyer.id,
      scope: data.scope,
      expiresAt,
      createdBy: user.id,
      createdAt: at,
    }
    store.consents.push(consent)
    await appendAudit(store, {
      tenantId: user.tenantId,
      actorId: user.id,
      action: 'consent.grant',
      objectRef: `consents/${consent.id}`,
      at,
    })
    return consent
  })

/** Revocation is immediate: every buyer read checks consent on the server. */
export const revokeConsent = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, OWNER)
    const store = await db()
    const consent = must(
      store.consents.find((c) => c.id === data.id),
      'consent',
    )
    requireTenantAccess(user, consent.supplierTenantId)
    if (consent.revokedAt) throw new AppError('CONFLICT', 'already revoked')
    const at = now(store)
    consent.revokedAt = at
    await appendAudit(store, {
      tenantId: user.tenantId,
      actorId: user.id,
      action: 'consent.revoke',
      objectRef: `consents/${consent.id}`,
      at,
    })
    return { ok: true }
  })

export const setOpenProfile = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ enabled: z.boolean() }))
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, OWNER)
    const store = await db()
    const tenant = must(
      store.tenants.find((t) => t.id === user.tenantId),
      'tenant',
    )
    tenant.openProfile = data.enabled
    return { enabled: tenant.openProfile }
  })
