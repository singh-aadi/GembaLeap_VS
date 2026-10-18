import type { Claim, ConsentScope } from '@gembaleap/schemas'
import type { Db } from '@/lib/store.server'

type Doc = Claim & { scope: ConsentScope | 'internal'; at: string }

const STOP = new Set([
  'the',
  'and',
  'for',
  'was',
  'were',
  'any',
  'this',
  'that',
  'what',
  'which',
  'with',
  'show',
  'did',
  'are',
  'from',
  'all',
  'how',
  'many',
  'week',
  'today',
])

/**
 * Keyword index over one supplier's records, used when the agent service is
 * not connected. The agent replaces it with vector retrieval and a written
 * answer; both only ever see documents the caller's scopes allow.
 */
export function buildIndex(store: Db, tenantId: string): Doc[] {
  const site = store.sites.find((s) => s.tenantId === tenantId)
  if (!site) return []
  const docs: Doc[] = []

  for (const r of store.checkRecords.filter((c) => c.siteId === site.id)) {
    const item = store.checklistItems.find((i) => i.id === r.itemId)
    if (!item) continue
    const reading = r.value !== undefined ? ` reading ${r.value}` : r.text ? ` ${r.text}` : ''
    const outcome = r.result === 'pass' ? 'within limit' : 'out of limit'
    docs.push({
      id: r.id,
      text: `${item.label.en} at ${r.slot}:${reading}, ${outcome}.${r.containment ? ` Containment: ${r.containment}` : ''}`,
      evidenceIds: r.evidenceIds,
      scope: 'reports',
      at: r.recordedAt,
    })
  }
  for (const e of store.events.filter((ev) => ev.siteId === site.id && ev.status === 'confirmed')) {
    const lot = store.lots.find((l) => l.id === e.lotId)
    docs.push({
      id: e.id,
      text: `${e.summaryEn} (${e.codes.join(', ')}${lot ? `, lot ${lot.lotNo}` : ''})`,
      evidenceIds: [e.id],
      scope: 'reports',
      at: e.createdAt,
    })
  }
  for (const lot of store.lots.filter((l) => l.tenantId === tenantId)) {
    const passport = store.passports.find((p) => p.lotId === lot.id)
    for (const check of passport?.checks ?? []) {
      if (check.evidenceIds.length === 0) continue
      docs.push({
        id: `${lot.id}:${check.rule}`,
        text: `Lot ${lot.lotNo} passport ${check.rule.replaceAll('_', ' ')}: ${check.result}. ${check.detail}${passport?.status === 'sealed' ? ' Passed first time and sealed.' : ''}`,
        evidenceIds: check.evidenceIds,
        scope: 'passports',
        at: lot.producedAt,
      })
    }
  }
  for (const cycle of store.cycles.filter((c) => c.siteId === site.id)) {
    docs.push({
      id: cycle.id,
      text: `Improvement cycle "${cycle.title}" is ${cycle.status}. Baseline ${cycle.baseline.value} ${cycle.baseline.unit}: ${cycle.baseline.metric}.`,
      evidenceIds: [...cycle.beforeEvidenceIds, ...cycle.verificationEvidenceIds],
      scope: 'cycles',
      at: cycle.openedAt,
    })
  }
  return docs
}

function terms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/out[- ]of[- ]limit/g, 'outoflimit')
    .split(/[^a-z0-9.-]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w))
}

export function search(docs: Doc[], question: string, limit = 4): Doc[] {
  const wanted = new Set(terms(question))
  return docs
    .map((doc) => {
      const have = terms(doc.text)
      const score = have.filter((w) => wanted.has(w)).length
      return { doc, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.doc.at.localeCompare(a.doc.at))
    .slice(0, limit)
    .map((r) => r.doc)
}
