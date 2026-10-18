import {
  Assessment,
  Bottleneck,
  CheckRecord,
  ChecklistItem,
  Consent,
  EvidenceItem,
  Event,
  ImprovementCycle,
  Lot,
  Ncr,
  Passport,
  QualityReport,
  ShiftBrief,
  Site,
  Stage,
  StageScore,
  SupplierScorecard,
  EvidenceProfile,
  Tenant,
  User,
  Invoice,
} from '@gembaleap/schemas'
import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import { buildSeed } from './index'

const seed = buildSeed('2026-10-18')

const collections: Array<[string, z.ZodType, unknown[]]> = [
  ['tenants', Tenant, seed.tenants],
  ['sites', Site, seed.sites],
  ['stages', Stage, seed.stages],
  ['users', User, seed.users],
  ['checklistItems', ChecklistItem, seed.checklistItems],
  ['checkRecords', CheckRecord, seed.checkRecords],
  ['events', Event, seed.events],
  ['evidence', EvidenceItem, seed.evidence],
  ['assessments', Assessment, seed.assessments],
  ['scores', StageScore, seed.scores],
  ['bottlenecks', Bottleneck, seed.bottlenecks],
  ['cycles', ImprovementCycle, seed.cycles],
  ['briefs', ShiftBrief, seed.briefs],
  ['lots', Lot, seed.lots],
  ['passports', Passport, seed.passports],
  ['ncrs', Ncr, seed.ncrs],
  ['consents', Consent, seed.consents],
  ['invoices', Invoice, seed.invoices],
  ['reports', QualityReport, seed.reports],
  ['scorecards', SupplierScorecard, seed.scorecards],
  ['profiles', EvidenceProfile, seed.profiles],
]

describe('seed', () => {
  it.each(collections)('%s match the schema', (_name, schema, rows) => {
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) expect(() => schema.parse(row)).not.toThrow()
  })

  it('only cites evidence that exists', () => {
    const known = new Set([...seed.evidence.map((e) => e.id), ...seed.events.map((e) => e.id)])
    const cited = [
      ...seed.scores.flatMap((s) => s.evidenceIds),
      ...seed.reports.flatMap((r) =>
        [...r.highlights, ...r.risks, ...r.actions].flatMap((c) => c.evidenceIds),
      ),
      ...seed.briefs.flatMap((b) => [...b.happened, ...b.watch].flatMap((c) => c.evidenceIds)),
      ...seed.ncrs.flatMap((n) => n.eightD?.citations.map((c) => c.evidenceId) ?? []),
      ...seed.passports.flatMap((p) => p.checks.flatMap((c) => c.evidenceIds)),
    ]
    expect(cited.filter((evidenceId) => !known.has(evidenceId))).toEqual([])
  })

  it('ranks bottlenecks by the priority formula', () => {
    const priorities = seed.bottlenecks.map((b) => b.priority)
    expect(priorities).toEqual([...priorities].sort((a, b) => b - a))
    expect(seed.bottlenecks[0]?.codes).toEqual(['D-PITCH-OOT'])
  })

  it('seeds exactly one heat-number mismatch', () => {
    const failing = seed.passports.filter((p) =>
      p.checks.some((c) => c.rule === 'heat_match' && c.result === 'fail'),
    )
    expect(failing).toHaveLength(1)
  })
})

describe('priority formula', () => {
  it('matches the cross-language ranking fixture', async () => {
    const { readFileSync } = await import('node:fs')
    const { priority } = await import('./improvement')
    const fixture = JSON.parse(
      readFileSync(
        new URL('../../schemas/fixtures/bottleneck-ranking.json', import.meta.url),
        'utf8',
      ),
    ) as Array<Parameters<typeof priority>[0] & { priority: number }>
    for (const row of fixture) expect(Math.round(priority(row) * 10) / 10).toBe(row.priority)
  })
})
