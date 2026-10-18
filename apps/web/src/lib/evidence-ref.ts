/** Display reference for anything an AI claim can cite: an evidence item or a whole event. */
export type EvidenceRef = {
  id: string
  kind: 'photo' | 'audio' | 'scan' | 'file' | 'event'
  caption: string
  at: string
  sha256?: string
  tenantId: string
}

export type EvidenceMap = Record<string, EvidenceRef>
