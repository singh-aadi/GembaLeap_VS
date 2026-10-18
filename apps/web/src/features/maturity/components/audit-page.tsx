import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { SendHorizontal, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { EvidenceList } from '@/components/app/evidence-link'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/field'
import { cn } from '@/lib/cn'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { answerAssessment } from '../api'
import { assessmentQuery, maturityKeys } from '../queries'

/** Chat-style audit interview. Resumable: the transcript is stored after every answer. */
export function AuditPage() {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const answer = useServerFn(answerAssessment)
  const { data } = useSuspenseQuery(assessmentQuery())
  const { assessment, timeZone } = data
  const [text, setText] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      answer({ data: { assessmentId: assessment.id, answer: text, evidenceIds: [] } }),
    onSuccess: () => {
      setText('')
      void queryClient.invalidateQueries({ queryKey: maturityKeys.all })
    },
    onError: (error) => toastError(t, error),
  })

  const open = assessment.status === 'in_progress'

  return (
    <>
      <PageHeader
        title={t('nav.audit')}
        meta={t('audit.meta', { date: f.date(assessment.startedAt, timeZone) })}
      />
      <Card className="mb-4 p-4">
        <div className="flex items-baseline justify-between text-sm">
          <span>
            {t('audit.progress', { asked: data.questionsAsked, max: assessment.maxQuestions })}
          </span>
          {open ? (
            <Badge tone="accent">{t('audit.inProgress')}</Badge>
          ) : (
            <Badge tone="good">{t('audit.done')}</Badge>
          )}
        </div>
        <Progress
          className="mt-2"
          value={data.questionsAsked}
          max={assessment.maxQuestions}
          label={t('audit.progressLabel')}
        />
        <p className="mt-3 text-xs text-muted">{t('audit.rule')}</p>
      </Card>
      <ol className="space-y-3 pb-36 lg:pb-0">
        {assessment.transcript.map((message, index) => (
          <li
            key={index}
            className={cn('flex', message.role === 'owner' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-lg border p-3 text-sm sm:max-w-[70%]',
                message.role === 'owner'
                  ? 'border-accent/30 bg-accent-soft'
                  : 'border-line border-l-4 border-l-teal bg-surface',
              )}
            >
              {message.role === 'auditor' ? (
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-teal">
                  <Sparkles className="size-3" aria-hidden />
                  {t('audit.auditor')}
                </p>
              ) : null}
              <p className="text-ink">{message.text}</p>
              {message.evidenceIds.length > 0 ? (
                <EvidenceList
                  ids={message.evidenceIds}
                  evidence={data.evidence}
                  timeZone={timeZone}
                />
              ) : null}
              <p className="mt-1 text-right text-[11px] text-muted tabular-nums">
                {f.time(message.at, timeZone)}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {open ? (
        <form
          className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-surface p-3 lg:static lg:mt-4 lg:rounded-lg lg:border"
          onSubmit={(e) => {
            e.preventDefault()
            if (text.trim()) mutation.mutate()
          }}
        >
          <div className="mx-auto flex max-w-[1200px] items-end gap-2">
            <Textarea
              aria-label={t('audit.answer')}
              placeholder={t('audit.answer')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className="min-h-11 flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              size="icon"
              disabled={!text.trim() || mutation.isPending}
            >
              <SendHorizontal aria-hidden />
              <span className="sr-only">{t('ask.send')}</span>
            </Button>
          </div>
        </form>
      ) : null}
    </>
  )
}
