import type { EvidenceItem } from '@gembaleap/schemas'
import type { Clock } from './clock'
import { fakeSha256, id } from './ids'
import { sites } from './tenants'

export type SeedContext = {
  clock: Clock
  evidence: EvidenceItem[]
  /** Registers a synthetic evidence item and returns its id. */
  ev: (
    key: string,
    input: {
      kind: EvidenceItem['kind']
      siteId: string
      by: string
      at: string
      caption: string
      extracted?: Record<string, unknown>
    },
  ) => string
}

const EXT: Record<EvidenceItem['kind'], string> = {
  photo: 'jpg',
  audio: 'm4a',
  scan: 'pdf',
  file: 'pdf',
}

export function createContext(clock: Clock): SeedContext {
  const evidence: EvidenceItem[] = []
  return {
    clock,
    evidence,
    ev(key, { kind, siteId, by, at, caption, extracted }) {
      const evidenceId = id(`evidence:${key}`)
      const site = sites.find((s) => s.id === siteId)
      if (!site) throw new Error(`Unknown site ${siteId}`)
      evidence.push({
        id: evidenceId,
        tenantId: site.tenantId,
        siteId,
        kind,
        storagePath: `tenants/${site.tenantId}/sites/${siteId}/evidence/${evidenceId}.${EXT[kind]}`,
        sha256: fakeSha256(key),
        caption,
        extracted,
        createdBy: by,
        createdAt: at,
      })
      return evidenceId
    },
  }
}
