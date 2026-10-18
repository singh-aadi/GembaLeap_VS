import type { Claim } from '@gembaleap/schemas'
import type { EvidenceMap } from '@/lib/evidence-ref'
import { EvidenceList } from './evidence-link'

/** AI-written statements, each followed by the evidence it rests on. */
export function ClaimList({
  claims,
  evidence,
  timeZone,
}: {
  claims: Claim[]
  evidence: EvidenceMap
  timeZone?: string
}) {
  return (
    <ul className="space-y-4">
      {claims.map((claim) => (
        <li key={claim.id} className="text-sm text-ink">
          {claim.text}
          <EvidenceList ids={claim.evidenceIds} evidence={evidence} timeZone={timeZone} />
        </li>
      ))}
    </ul>
  )
}
