import { AiBlock } from '@/components/app/ai-block'
import { EvidenceList } from '@/components/app/evidence-link'
import { StatusBadge } from '@/components/app/status-badge'
import { Card, CardHeader } from '@/components/ui/card'
import { useT } from '@/lib/i18n'
import type { LotDetail } from '../queries'

export function PassportChecks({ data }: { data: LotDetail }) {
  const t = useT()
  return (
    <Card>
      <CardHeader title={t('passport.rules')} description={t('passport.rulesHint')} />
      <ul className="divide-y divide-line">
        {data.passport.checks.map((check) => (
          <li key={check.rule} className="px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{t(`rule.${check.rule}`)}</p>
              <StatusBadge status={check.result} label={t(`result.${check.result}`)} />
            </div>
            <p className="mt-1 text-sm text-muted">{check.detail}</p>
            {check.evidenceIds.length > 0 ? (
              <EvidenceList
                ids={check.evidenceIds}
                evidence={data.evidence}
                timeZone={data.timeZone}
              />
            ) : null}
            {check.explanation ? (
              <AiBlock approved={false} className="mt-3">
                <p className="text-sm">{check.explanation}</p>
              </AiBlock>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  )
}
