import { AiBlock } from '@/components/app/ai-block'
import { ClaimList } from '@/components/app/claim-list'
import { Card } from '@/components/ui/card'
import { useT } from '@/lib/i18n'
import type { askEvidence } from '../api'

export type Exchange = Awaited<ReturnType<typeof askEvidence>>

export function AnswerCard({ exchange }: { exchange: Exchange }) {
  const t = useT()
  const { answer, evidence, timeZone } = exchange
  const found = answer.claims.length
  return (
    <Card className="p-4">
      <p className="text-sm font-medium text-heading">{answer.question}</p>
      <AiBlock
        approved={false}
        className="mt-3"
        source={t(answer.source === 'agent' ? 'ask.source.agent' : 'ask.source.local', {
          count: answer.searched,
        })}
      >
        {answer.answer ? <p className="mb-3 text-sm text-ink">{answer.answer}</p> : null}
        {found === 0 ? (
          <p className="text-sm text-muted">{t('ask.noMatch')}</p>
        ) : (
          <>
            {answer.source === 'local_index' ? (
              <p className="mb-3 text-sm text-muted">{t('ask.localAnswer', { count: found })}</p>
            ) : null}
            <ClaimList claims={answer.claims} evidence={evidence} timeZone={timeZone} />
          </>
        )}
      </AiBlock>
    </Card>
  )
}
