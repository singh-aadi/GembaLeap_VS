import { paymentClock, schemeEligibility } from '@sutraos/schemas'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { appendAudit, db, now } from '@/lib/store.server'

export const getCash = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, ['supplier_owner'])
    const store = await db()
    const site = siteOf(store, user)
    const at = now(store)
    const profile = store.plantProfiles.find((p) => p.siteId === site.id)
    const invoices = store.invoices
      .filter((i) => i.supplierTenantId === site.tenantId)
      .map((i) => ({
        ...i,
        buyerName: store.tenants.find((t) => t.id === i.buyerTenantId)?.name ?? '',
        clock: paymentClock(i.issuedAt, i.paidAt, at, i.termDays),
      }))
      .sort((a, b) => b.clock.day - a.clock.day)
    const open = invoices.filter((i) => !i.paidAt)
    return {
      invoices,
      outstanding: open.reduce((sum, i) => sum + i.amount, 0),
      overdue: open.filter((i) => i.clock.status === 'overdue').length,
      currency: invoices[0]?.currency ?? 'INR',
      schemes: profile
        ? store.schemes.map((s) => ({ ...s, ...schemeEligibility(s, profile) }))
        : [],
      referred: store.audit.some(
        (a) => a.tenantId === site.tenantId && a.action === 'referral.consent',
      ),
    }
  })

/** Consent to share the verified operating summary with a TReDS platform. SutraOS shows the clock; it does not lend. */
export const consentTredsReferral = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ partner: z.literal('treds') }))
  .handler(async ({ context: { user } }) => {
    requireRole(user, ['supplier_owner'])
    const store = await db()
    const site = siteOf(store, user)
    await appendAudit(store, {
      tenantId: site.tenantId,
      actorId: user.id,
      action: 'referral.consent',
      objectRef: 'referrals/treds',
      at: now(store),
    })
    return { ok: true }
  })
