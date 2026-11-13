import type { AuditStandard } from '@sutraos/schemas'
import { evidenceRefs, now, type Db } from '@/lib/store.server'

type Source = 'checks' | 'passports' | 'capa' | 'reports' | 'calibration' | 'training'

/** Clause index per standard: which kind of record proves each clause. Extended by the Process Library. */
const CLAUSES: Record<AuditStandard, Array<{ ref: string; title: string; source: Source }>> = {
  zed: [
    { ref: 'ZED-B1', title: 'Daily production and quality records', source: 'checks' },
    {
      ref: 'ZED-B2',
      title: 'Measuring instruments identified and calibrated',
      source: 'calibration',
    },
    { ref: 'ZED-B3', title: 'Material traceability from receipt to dispatch', source: 'passports' },
    { ref: 'ZED-S1', title: 'Problem solving with root cause and action', source: 'capa' },
    { ref: 'ZED-S2', title: 'Workforce skills and training records', source: 'training' },
  ],
  iso9001: [
    { ref: '7.1.5', title: 'Monitoring and measuring resources', source: 'calibration' },
    { ref: '8.5.1', title: 'Control of production', source: 'checks' },
    { ref: '8.5.2', title: 'Identification and traceability', source: 'passports' },
    { ref: '9.1.3', title: 'Analysis and evaluation', source: 'reports' },
    { ref: '10.2', title: 'Nonconformity and corrective action', source: 'capa' },
  ],
  iatf16949: [
    { ref: '7.1.5.2', title: 'Calibration and verification records', source: 'calibration' },
    { ref: '8.5.1.1', title: 'Control plan in use', source: 'checks' },
    { ref: '8.5.2.1', title: 'Traceability', source: 'passports' },
    { ref: '9.1.1.1', title: 'Monitoring and measurement of processes', source: 'reports' },
    { ref: '10.2.3', title: 'Problem solving', source: 'capa' },
  ],
}

const GAP: Record<Source, string> = {
  checks: 'No checklist records with evidence yet',
  passports: 'No sealed lot passport yet',
  capa: 'No improvement cycle closed with evidence yet',
  reports: 'No published quality report yet',
  calibration: 'No calibration certificates uploaded',
  training: 'No training records uploaded',
}

/** Builds a clause-to-evidence map. A clause without evidence shows an explicit gap, never invented evidence. */
export function buildAuditPack(store: Db, siteId: string, standard: AuditStandard) {
  const site = store.sites.find((s) => s.id === siteId)
  const seeded = store.auditPacks.find((p) => p.siteId === siteId && p.standard === standard)
  const sources: Record<Source, string[]> = {
    checks: store.checkRecords
      .filter((r) => r.siteId === siteId)
      .slice(-3)
      .flatMap((r) => r.evidenceIds),
    passports: store.passports
      .filter(
        (p) =>
          p.status === 'sealed' && store.lots.some((l) => l.id === p.lotId && l.siteId === siteId),
      )
      .slice(0, 2)
      .flatMap((p) => p.checks.flatMap((c) => c.evidenceIds).slice(0, 2)),
    capa: store.cycles
      .filter((c) => c.siteId === siteId && c.status === 'closed')
      .flatMap((c) => c.verificationEvidenceIds),
    reports: store.reports
      .filter((r) => r.siteId === siteId && r.status === 'published')
      .slice(0, 2)
      .flatMap((r) => r.highlights.flatMap((h) => h.evidenceIds)),
    calibration: [],
    training: [],
  }
  const clauses = CLAUSES[standard].map((c) => {
    const fromSeed = seeded?.clauses.find((s) => s.ref === c.ref)
    const evidenceIds = [...new Set([...(fromSeed?.evidenceIds ?? []), ...sources[c.source]])]
    return {
      ref: c.ref,
      title: c.title,
      evidenceIds,
      gap: evidenceIds.length ? undefined : (fromSeed?.gap ?? GAP[c.source]),
    }
  })
  return {
    standard,
    siteName: site?.name ?? '',
    builtAt: now(store),
    clauses,
    covered: clauses.filter((c) => !c.gap).length,
    evidence: evidenceRefs(
      store,
      clauses.flatMap((c) => c.evidenceIds),
    ),
    timeZone: site?.timeZone ?? 'UTC',
  }
}
