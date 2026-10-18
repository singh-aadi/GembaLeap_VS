import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Check, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { AiBlock } from '@/components/app/ai-block'
import { BackLink } from '@/components/app/back-link'
import { ConfirmBar } from '@/components/app/confirm-bar'
import { EvidenceList } from '@/components/app/evidence-link'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { LOCALE_NAMES, useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { confirmEvent } from '../api'
import { eventDetailQuery, eventKeys } from '../queries'
import { CodePicker } from './code-picker'
import { EventStatusBadge, EventTypeBadge } from './event-type-badge'

const route = getRouteApi('/s/events/$eventId')

export function EventDetail() {
  const t = useT()
  const f = useFormat()
  const pick = useLocalized()
  const { eventId } = route.useParams()
  const queryClient = useQueryClient()
  const confirm = useServerFn(confirmEvent)
  const { data } = useSuspenseQuery(eventDetailQuery(eventId))
  const { event } = data
  const [editing, setEditing] = useState(false)
  const [codes, setCodes] = useState(event.codes)

  const mutation = useMutation({
    mutationFn: (input: { codes?: string[] }) => confirm({ data: { eventId, ...input } }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(eventId) })
      const previous = queryClient.getQueryData(eventDetailQuery(eventId).queryKey)
      if (previous) {
        queryClient.setQueryData(eventDetailQuery(eventId).queryKey, {
          ...previous,
          event: { ...previous.event, status: 'confirmed' as const, codes },
        })
      }
      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous)
        queryClient.setQueryData(eventDetailQuery(eventId).queryKey, context.previous)
      toastError(t, error)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  })

  const confirmed = event.status === 'confirmed'
  const localeName = LOCALE_NAMES[event.locale]

  return (
    <>
      <PageHeader
        back={<BackLink to="/s/events">{t('events.title')}</BackLink>}
        title={
          <span className="flex flex-wrap items-center gap-2">
            <EventTypeBadge type={event.type} />
            <EventStatusBadge status={event.status} />
          </span>
        }
        meta={`${data.stage ? pick(data.stage.name) : ''} · ${f.dateTime(event.createdAt, data.timeZone)} · ${data.author}`}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-4">
          <AiBlock
            approved={confirmed}
            approvedLabel={t('event.confirmedBadge')}
            source={t('event.aiSource')}
          >
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-muted">
                  {t('event.original', { language: localeName })}
                </dt>
                <dd lang={event.locale} className="mt-1 text-base text-ink">
                  {event.summaryLocal || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{t('event.english')}</dt>
                <dd className="mt-1 text-ink">
                  {event.summaryEn || t('event.translationPending')}
                </dd>
              </div>
              {event.summaryJa ? (
                <div>
                  <dt className="text-xs text-muted">{t('event.japanese')}</dt>
                  <dd lang="ja" className="mt-1 text-ink">
                    {event.summaryJa}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-muted">{t('event.codes')}</dt>
                <dd className="mt-1">
                  {editing && !confirmed ? (
                    <CodePicker catalogue={data.codeCatalogue} value={codes} onChange={setCodes} />
                  ) : (
                    <span className="font-mono text-sm">{event.codes.join(', ') || '—'}</span>
                  )}
                </dd>
              </div>
            </dl>
          </AiBlock>
        </Card>
        <Card>
          <CardHeader title={t('event.facts')} />
          <CardBody>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-muted">{t('event.severity')}</dt>
              <dd className="tabular-nums">{event.severity} / 5</dd>
              <dt className="text-muted">{t('event.loss')}</dt>
              <dd className="tabular-nums">
                {event.lossMinutes !== undefined
                  ? t('common.minutes', { n: event.lossMinutes })
                  : '—'}
              </dd>
              <dt className="text-muted">{t('event.lot')}</dt>
              <dd className="font-mono text-xs">{data.lot?.lotNo ?? '—'}</dd>
            </dl>
            <p className="mt-4 text-xs font-medium text-muted">
              {t('event.evidence', { count: event.evidenceIds.length })}
            </p>
            <EvidenceList
              ids={event.evidenceIds}
              evidence={data.evidence}
              timeZone={data.timeZone}
            />
            {confirmed && data.auditSeq ? (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck className="size-3.5 text-good" aria-hidden />
                {t('event.audit', { seq: data.auditSeq })}
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>
      {!confirmed ? (
        <ConfirmBar note={t('event.confirmNote')}>
          {editing ? null : <Button onClick={() => setEditing(true)}>{t('event.correct')}</Button>}
          <Button
            variant="primary"
            disabled={mutation.isPending || codes.length === 0}
            onClick={() => mutation.mutate(editing ? { codes } : {})}
          >
            <Check aria-hidden />
            {t('event.confirm')}
          </Button>
        </ConfirmBar>
      ) : null}
    </>
  )
}
