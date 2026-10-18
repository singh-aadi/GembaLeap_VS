import {
  ById,
  EIGHT_D_FIELDS,
  EightD,
  NcrMessageInput,
  RaiseNcrInput,
  type Ncr,
  type User,
} from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { agentsConfigured, callAgent } from '@/lib/agents.server'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireConsent, requireRole } from '@/lib/auth.server'
import { appendAudit, db, evidenceRefs, must, newId, now, type Db } from '@/lib/store.server'

const SUPPLIER_SIDE = ['supplier_owner', 'supplier_quality'] as const
const ALL = [...SUPPLIER_SIDE, 'buyer_quality'] as const

/** D2–D7 must each cite evidence; D1 (team) and D8 (closure criterion) state facts about people and plans. */
export const CITED_FIELDS = EIGHT_D_FIELDS.slice(1, 7)

function party(user: User, ncr: Ncr): 'supplier' | 'buyer' {
  if (user.tenantId === ncr.supplierTenantId) return 'supplier'
  if (user.tenantId === ncr.buyerTenantId) return 'buyer'
  throw new AppError('FORBIDDEN', 'ncr')
}

function view(store: Db, ncr: Ncr, side: 'supplier' | 'buyer') {
  const lot = store.lots.find((l) => l.id === ncr.lotId)
  const names = (tenantId: string) => store.tenants.find((t) => t.id === tenantId)?.name ?? ''
  const ids = [
    ...(ncr.eightD?.citations.map((c) => c.evidenceId) ?? []),
    ...ncr.thread.flatMap((m) => m.evidenceIds),
  ]
  return {
    ncr,
    side,
    lotNo: lot?.lotNo ?? '',
    partName: lot?.partName ?? '',
    supplierName: names(ncr.supplierTenantId),
    buyerName: names(ncr.buyerTenantId),
    thread: ncr.thread.map((m) => {
      const author = store.users.find((u) => u.id === m.authorId)
      return {
        ...m,
        authorName: author?.name ?? '',
        authorSide:
          author?.tenantId === ncr.buyerTenantId ? ('buyer' as const) : ('supplier' as const),
      }
    }),
    approvedByName: store.users.find((u) => u.id === ncr.eightDApprovedBy)?.name,
    missingCitations: ncr.eightD
      ? CITED_FIELDS.filter((f) => !ncr.eightD?.citations.some((c) => c.field === f))
      : [...CITED_FIELDS],
    evidence: evidenceRefs(store, ids),
    timeZone: store.sites.find((s) => s.id === lot?.siteId)?.timeZone ?? 'UTC',
  }
}

export const listNcrs = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, ALL)
    const store = await db()
    return store.ncrs
      .filter((n) => n.supplierTenantId === user.tenantId || n.buyerTenantId === user.tenantId)
      .sort((a, b) => b.raisedAt.localeCompare(a.raisedAt))
      .map((n) => ({
        id: n.id,
        number: n.number,
        title: n.title,
        status: n.status,
        raisedAt: n.raisedAt,
        lotNo: store.lots.find((l) => l.id === n.lotId)?.lotNo ?? '',
        counterpart:
          store.tenants.find(
            (t) =>
              t.id === (user.tenantId === n.buyerTenantId ? n.supplierTenantId : n.buyerTenantId),
          )?.name ?? '',
      }))
  })

export const getNcr = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ALL)
    const store = await db()
    const ncr = must(
      store.ncrs.find((n) => n.id === data.id),
      'ncr',
    )
    return view(store, ncr, party(user, ncr))
  })

/** The 8D co-pilot drafts from the NCR, the lot's events and similar past cases. */
export const draftEightD = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_SIDE)
    const store = await db()
    const ncr = must(
      store.ncrs.find((n) => n.id === data.id),
      'ncr',
    )
    if (party(user, ncr) !== 'supplier') throw new AppError('FORBIDDEN')
    if (!agentsConfigured())
      throw new AppError('AGENT_UNAVAILABLE', '8D drafting needs the agent service')
    ncr.eightD = await callAgent(
      '/agents/quality/8d',
      ncr.supplierTenantId,
      { ncrId: ncr.id },
      EightD,
    )
    ncr.status = 'eight_d_draft'
    return { ok: true }
  })

export const approveEightD = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, SUPPLIER_SIDE)
    const store = await db()
    const ncr = must(
      store.ncrs.find((n) => n.id === data.id),
      'ncr',
    )
    if (party(user, ncr) !== 'supplier') throw new AppError('FORBIDDEN')
    if (ncr.status !== 'eight_d_draft' || !ncr.eightD) throw new AppError('CONFLICT', ncr.status)
    if (view(store, ncr, 'supplier').missingCitations.length > 0)
      throw new AppError('VALIDATION', 'citations')
    const at = now(store)
    ncr.status = 'eight_d_submitted'
    ncr.eightDApprovedBy = user.id
    await appendAudit(store, {
      tenantId: ncr.supplierTenantId,
      actorId: user.id,
      action: 'eightd.approve',
      objectRef: `ncrs/${ncr.id}`,
      at,
    })
    return { ok: true }
  })

export const acceptEightD = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ById)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['buyer_quality'])
    const store = await db()
    const ncr = must(
      store.ncrs.find((n) => n.id === data.id),
      'ncr',
    )
    if (party(user, ncr) !== 'buyer') throw new AppError('FORBIDDEN')
    if (ncr.status !== 'eight_d_submitted') throw new AppError('CONFLICT', ncr.status)
    ncr.status = 'accepted'
    return { ok: true }
  })

export const postNcrMessage = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(NcrMessageInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ALL)
    const store = await db()
    const ncr = must(
      store.ncrs.find((n) => n.id === data.ncrId),
      'ncr',
    )
    party(user, ncr)
    ncr.thread.push({
      id: newId(),
      authorId: user.id,
      text: data.text,
      evidenceIds: [],
      at: now(store),
    })
    return { ok: true }
  })

export const raiseNcr = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(RaiseNcrInput)
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['buyer_quality'])
    const store = await db()
    const lot = must(
      store.lots.find((l) => l.id === data.lotId && l.buyerTenantId === user.tenantId),
      'lot',
    )
    requireConsent(store, user, lot.tenantId, 'passports')
    const at = now(store)
    const number = `NCR-${String(Math.max(0, ...store.ncrs.map((n) => Number(n.number.slice(4)))) + 1).padStart(4, '0')}`
    const ncr: Ncr = {
      id: newId(),
      number,
      buyerTenantId: user.tenantId,
      supplierTenantId: lot.tenantId,
      lotId: lot.id,
      title: data.title,
      description: data.description,
      raisedBy: user.id,
      raisedAt: at,
      status: 'open',
      thread: [{ id: newId(), authorId: user.id, text: data.description, evidenceIds: [], at }],
    }
    store.ncrs.push(ncr)
    return { id: ncr.id }
  })
