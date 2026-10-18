import { AskAnswer, AskInput, BUYER_ROLES, type ConsentScope } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { agentsConfigured, callAgent } from '@/lib/agents.server'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { activeConsent, requireRole } from '@/lib/auth.server'
import { db, evidenceRefs, newId } from '@/lib/store.server'
import { buildIndex, search } from './ask.server'

const ASK_ROLES = ['supplier_owner', 'supplier_quality', ...BUYER_ROLES] as const

export const getAskScope = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, ASK_ROLES)
    const store = await db()
    const isBuyer = (BUYER_ROLES as readonly string[]).includes(user.role)
    const suppliers = isBuyer
      ? store.consents
          .filter(
            (c) =>
              c.buyerTenantId === user.tenantId &&
              activeConsent(store, c.supplierTenantId, user.tenantId),
          )
          .map((c) => ({
            id: c.supplierTenantId,
            name: store.tenants.find((t) => t.id === c.supplierTenantId)?.name ?? '',
            scope: c.scope,
          }))
          .filter((s) => store.sites.some((site) => site.tenantId === s.id))
      : []
    return { isBuyer, suppliers }
  })

export const askEvidence = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(AskInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ASK_ROLES)
    const store = await db()
    const isBuyer = (BUYER_ROLES as readonly string[]).includes(user.role)
    const tenantId = isBuyer ? data.supplierTenantId : user.tenantId
    if (!tenantId) throw new AppError('VALIDATION', 'supplier')

    let scopes: Array<ConsentScope | 'internal'> = [
      'internal',
      'reports',
      'passports',
      'cycles',
      'maturity',
    ]
    if (isBuyer) {
      const consent = activeConsent(store, tenantId, user.tenantId)
      if (!consent) throw new AppError('NO_CONSENT')
      scopes = consent.scope
    }

    const docs = buildIndex(store, tenantId).filter((d) => scopes.includes(d.scope))
    const answer: AskAnswer = agentsConfigured()
      ? await callAgent('/agents/ask', tenantId, { question: data.question, scopes }, AskAnswer)
      : {
          id: newId(),
          question: data.question,
          answer: '',
          claims: search(docs, data.question).map(({ id, text, evidenceIds }) => ({
            id,
            text,
            evidenceIds,
          })),
          searched: docs.length,
          source: 'local_index',
        }
    return {
      answer,
      evidence: evidenceRefs(
        store,
        answer.claims.flatMap((c) => c.evidenceIds),
      ),
      timeZone: store.sites.find((s) => s.tenantId === tenantId)?.timeZone ?? 'UTC',
    }
  })
