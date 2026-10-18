import type { ConsentScope, Role, User } from '@gembaleap/schemas'
import { AppError } from './app-error'
import { now, type Db } from './store.server'

export function requireRole(user: User, roles: readonly Role[]) {
  if (!roles.includes(user.role)) throw new AppError('FORBIDDEN', `role ${user.role}`)
}

export function requireTenantAccess(user: User, tenantId: string) {
  if (user.tenantId !== tenantId) throw new AppError('FORBIDDEN', 'tenant')
}

export function activeConsent(store: Db, supplierTenantId: string, buyerTenantId: string) {
  const at = now(store)
  return store.consents.find(
    (c) =>
      c.supplierTenantId === supplierTenantId &&
      c.buyerTenantId === buyerTenantId &&
      !c.revokedAt &&
      c.expiresAt > at,
  )
}

/** Own-tenant reads pass; buyer reads need a live consent that covers the scope. */
export function requireConsent(
  store: Db,
  user: User,
  supplierTenantId: string,
  scope: ConsentScope,
) {
  if (user.tenantId === supplierTenantId) return
  const consent = activeConsent(store, supplierTenantId, user.tenantId)
  if (!consent?.scope.includes(scope)) throw new AppError('NO_CONSENT', scope)
}

/** The supplier site a supplier-side user works at. */
export function siteOf(store: Db, user: User) {
  const site = store.sites.find((s) => user.siteIds.includes(s.id))
  if (!site) throw new AppError('FORBIDDEN', 'no site')
  return site
}
