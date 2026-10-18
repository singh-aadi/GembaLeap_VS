import { sealReport } from '@gembaleap/schemas'
import { beforeAll, describe, expect, it } from 'vitest'
import { checklistState } from '@/features/checklist/checklist.server'
import { appendAudit, db, verifyAuditChain, type Db } from './store.server'

let store: Db

beforeAll(async () => {
  process.env.SEED_DATE = '2026-10-18'
  store = await db()
})

describe('audit chain', () => {
  it('verifies the seeded chain and detects tampering', async () => {
    expect(await verifyAuditChain(store)).toBe(true)
    const entry = store.audit[3]
    if (!entry) throw new Error('seed has no audit entries')
    const original = entry.objectRef
    entry.objectRef = `${original}-edited`
    expect(await verifyAuditChain(store)).toBe(false)
    entry.objectRef = original
    expect(await verifyAuditChain(store)).toBe(true)
  })

  it('links each appended entry to the previous hash', async () => {
    const prev = store.audit.at(-1)
    const next = await appendAudit(store, {
      tenantId: store.tenants[1]?.id ?? '',
      actorId: store.users[0]?.id ?? '',
      action: 'buyer.view',
      objectRef: 'test',
      at: store.now,
    })
    expect(next.prevHash).toBe(prev?.hash)
    expect(await verifyAuditChain(store)).toBe(true)
  })
})

describe('report seal', () => {
  it('matches the published content and breaks on any edit', async () => {
    const report = store.reports.find((r) => r.status === 'published')
    if (!report) throw new Error('no published report')
    expect(await sealReport(report)).toBe(report.sealHash)
    expect(
      await sealReport({
        ...report,
        metrics: { ...report.metrics, outOfLimit: report.metrics.outOfLimit + 1 },
      }),
    ).not.toBe(report.sealHash)
  })
})

describe('checklist state', () => {
  it('derives slot status from records and the demo clock', () => {
    const site = store.sites.find((s) => s.name === 'Toyota plant')
    if (!site) throw new Error('no site')
    const { summary } = checklistState(store, site)
    expect(summary.scheduled).toBe(20)
    expect(summary.outOfLimit).toBe(2)
    expect(summary.contained).toBe(2)
    expect(summary.done).toBeGreaterThanOrEqual(14)
  })
})
