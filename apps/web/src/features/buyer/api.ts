import {
  BUYER_ROLES,
  HeatmapFilters,
  Id,
  SourcingFilters,
  TierDecisionInput,
  type Tenant,
} from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { maturityView } from '@/features/maturity/maturity.server'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { activeConsent, requireRole } from '@/lib/auth.server'
import { db, must, newId, now, type Db } from '@/lib/store.server'

const DRIFT_ORDER = { drifting: 0, stable: 1, improving: 2 } as const

function consentedSuppliers(store: Db, buyerTenantId: string) {
  return store.tenants.flatMap((tenant) => {
    if (tenant.kind !== 'supplier') return []
    const consent = activeConsent(store, tenant.id, buyerTenantId)
    const card = store.scorecards.find((s) => s.tenantId === tenant.id)
    return consent && card ? [{ tenant, consent, card }] : []
  })
}

/** Heat-map rows exist only for suppliers with a live consent. There is no public ranking. */
export const getSupplierHeatmap = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(HeatmapFilters)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, BUYER_ROLES)
    const store = await db()
    const all = consentedSuppliers(store, user.tenantId)
    const rows = all
      .filter(({ tenant }) => !data.sector || tenant.sector === data.sector)
      .filter(({ card }) => !data.drift || card.drift === data.drift)
      .map(({ tenant, consent, card }) => ({
        id: tenant.id,
        name: tenant.name,
        city: tenant.city,
        country: tenant.country,
        sector: tenant.sector,
        ...card,
        dimensions: consent.scope.includes('maturity') ? card.dimensions : null,
      }))
      .sort((a, b) => {
        switch (data.sort) {
          case 'ladder':
            return b.siteIndex - a.siteIndex
          case 'adherence':
            return b.checklistAdherence30d - a.checklistAdherence30d
          case 'name':
            return a.name.localeCompare(b.name)
          case 'risk':
            return (
              DRIFT_ORDER[a.drift] - DRIFT_ORDER[b.drift] ||
              a.checklistAdherence30d - b.checklistAdherence30d
            )
        }
      })
    return {
      rows,
      sectors: [...new Set(all.map(({ tenant }) => tenant.sector))].sort(),
      buyerName: store.tenants.find((t) => t.id === user.tenantId)?.name ?? '',
      clock: now(store),
    }
  })

export const getSupplierDetail = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ tenantId: Id }))
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, BUYER_ROLES)
    const store = await db()
    const tenant = must(
      store.tenants.find((t) => t.id === data.tenantId && t.kind === 'supplier'),
      'supplier',
    )
    const consent = activeConsent(store, tenant.id, user.tenantId)
    if (!consent) throw new AppError('NO_CONSENT')
    const card = must(
      store.scorecards.find((s) => s.tenantId === tenant.id),
      'scorecard',
    )
    const site = store.sites.find((s) => s.tenantId === tenant.id)
    const has = (scope: (typeof consent.scope)[number]) => consent.scope.includes(scope)
    const at = now(store)

    return {
      tenant: pickTenant(tenant),
      card,
      scope: consent.scope,
      consentExpiresAt: consent.expiresAt,
      canDecide: user.role === 'buyer_quality',
      maturity: has('maturity') && site ? maturityView(store, site.id) : null,
      reports: has('reports')
        ? store.reports
            .filter((r) => r.tenantId === tenant.id && r.status === 'published')
            .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))
            .slice(0, 5)
            .map((r) => ({
              id: r.id,
              period: r.period,
              periodStart: r.periodStart,
              periodEnd: r.periodEnd,
              checksDone: r.metrics.checksDone,
              checksDue: r.metrics.checksDue,
              outOfLimit: r.metrics.outOfLimit,
            }))
        : null,
      passports: has('passports')
        ? store.lots
            .filter((l) => l.tenantId === tenant.id && l.buyerTenantId === user.tenantId)
            .flatMap((l) => {
              const p = store.passports.find((x) => x.lotId === l.id)
              return p?.status === 'sealed'
                ? [
                    {
                      lotId: l.id,
                      lotNo: l.lotNo,
                      partNo: l.partNo,
                      overall: p.overall,
                      sealedAt: p.sealedAt,
                    },
                  ]
                : []
            })
        : null,
      cycles:
        has('cycles') && site
          ? store.cycles
              .filter((c) => c.siteId === site.id)
              .map((c) => ({
                id: c.id,
                title: c.title,
                status: c.status,
                fromLevel: c.fromLevel,
                targetLevel: c.targetLevel,
                dueAt: c.dueAt,
              }))
          : null,
      invoices: store.invoices
        .filter((i) => i.supplierTenantId === tenant.id && i.buyerTenantId === user.tenantId)
        .map((i) => ({
          ...i,
          day: Math.floor(
            ((i.paidAt ? Date.parse(i.paidAt) : Date.parse(at)) - Date.parse(i.issuedAt)) /
              86_400_000,
          ),
        })),
      ncrs: store.ncrs
        .filter((n) => n.supplierTenantId === tenant.id && n.buyerTenantId === user.tenantId)
        .map((n) => ({ id: n.id, number: n.number, title: n.title, status: n.status })),
      timeZone: site?.timeZone ?? 'UTC',
    }
  })

function pickTenant({ id, name, city, country, sector, processes }: Tenant) {
  return { id, name, city, country, sector, processes }
}

/** The buyer decides the inspection tier. The evidence only suggests it. */
export const decideInspectionTier = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(TierDecisionInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['buyer_quality'])
    const store = await db()
    if (!activeConsent(store, data.supplierTenantId, user.tenantId))
      throw new AppError('NO_CONSENT')
    const card = must(
      store.scorecards.find((s) => s.tenantId === data.supplierTenantId),
      'scorecard',
    )
    card.inspectionTier = data.tier
    if (card.suggestedTier === data.tier) card.suggestedTier = undefined
    return { tier: card.inspectionTier }
  })

/** Suppliers that opted in to be found and do not share with this buyer yet. Ordered by evidence depth. */
export const getSourcing = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(SourcingFilters)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, BUYER_ROLES)
    const store = await db()
    const listed = store.tenants.filter(
      (t) => t.kind === 'supplier' && t.openProfile && !activeConsent(store, t.id, user.tenantId),
    )
    const rows = listed
      .flatMap((tenant) => {
        const profile = store.profiles.find((p) => p.tenantId === tenant.id)
        return profile ? [{ tenant: pickTenant(tenant), profile }] : []
      })
      .filter(({ tenant }) => !data.process || tenant.processes.includes(data.process))
      .filter(({ profile }) => data.minLadder === undefined || profile.ladder >= data.minLadder)
      .sort((a, b) => b.profile.evidenceDays - a.profile.evidenceDays)
      .map((row) => ({
        ...row,
        requested: store.evidenceRequests.some(
          (r) => r.buyerTenantId === user.tenantId && r.supplierTenantId === row.tenant.id,
        ),
      }))
    const certIds = rows.flatMap((r) => r.profile.certifications.map((c) => c.evidenceId))
    return {
      rows,
      processes: [...new Set(listed.flatMap((t) => t.processes))].sort(),
      certificates: Object.fromEntries(
        store.evidence
          .filter((e) => certIds.includes(e.id))
          .map((e) => [
            e.id,
            {
              id: e.id,
              kind: e.kind,
              caption: e.caption ?? '',
              at: e.createdAt,
              sha256: e.sha256,
              tenantId: e.tenantId,
            },
          ]),
      ),
    }
  })

export const requestEvidenceWindow = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ tenantId: Id }))
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, BUYER_ROLES)
    const store = await db()
    const tenant = must(
      store.tenants.find((t) => t.id === data.tenantId && t.openProfile),
      'supplier',
    )
    if (
      !store.evidenceRequests.some(
        (r) => r.buyerTenantId === user.tenantId && r.supplierTenantId === tenant.id,
      )
    ) {
      store.evidenceRequests.push({
        id: newId(),
        buyerTenantId: user.tenantId,
        supplierTenantId: tenant.id,
        requestedBy: user.id,
        at: now(store),
      })
    }
    return { ok: true }
  })
