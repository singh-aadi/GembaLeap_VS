import { EIGHT_D_FIELDS } from '@gembaleap/schemas'
import { TriangleAlert } from 'lucide-react'
import { AiBlock } from '@/components/app/ai-block'
import { EvidenceList } from '@/components/app/evidence-link'
import { useT } from '@/lib/i18n'
import type { NcrView } from '../queries'

/** D1–D8 with the evidence each field rests on. Fields that need evidence and have none are flagged. */
export function EightDView({ data }: { data: NcrView }) {
  const t = useT()
  const { ncr } = data
  if (!ncr.eightD) return null
  const eightD = ncr.eightD
  const approved =
    ncr.status === 'eight_d_submitted' || ncr.status === 'accepted' || ncr.status === 'closed'
  return (
    <AiBlock
      approved={approved}
      approvedLabel={
        data.approvedByName ? t('ncr.approvedBy', { name: data.approvedByName }) : undefined
      }
      source={t('ncr.aiSource')}
    >
      <ol className="mt-2 space-y-5">
        {EIGHT_D_FIELDS.map((field, index) => {
          const cited = eightD.citations.filter((c) => c.field === field).map((c) => c.evidenceId)
          const missing = (data.missingCitations as readonly string[]).includes(field)
          return (
            <li key={field}>
              <h3 className="text-sm">
                <span className="mr-2 font-mono text-xs text-muted">D{index + 1}</span>
                {t(`eightD.${field}`)}
              </h3>
              <p className="mt-1 text-sm text-ink">{eightD[field]}</p>
              {cited.length > 0 ? (
                <EvidenceList ids={cited} evidence={data.evidence} timeZone={data.timeZone} />
              ) : null}
              {missing ? (
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-warn-ink">
                  <TriangleAlert className="size-3.5" aria-hidden />
                  {t('ncr.needsEvidence')}
                </p>
              ) : null}
            </li>
          )
        })}
      </ol>
      {eightD.similarCases.length > 0 ? (
        <p className="mt-5 border-t border-line pt-3 text-xs text-muted">
          {t('ncr.similar')}: {eightD.similarCases.join('; ')}
        </p>
      ) : null}
    </AiBlock>
  )
}
