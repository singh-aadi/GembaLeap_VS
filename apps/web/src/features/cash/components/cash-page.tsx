import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Check, CircleCheck, CircleX } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app/page-header'
import { Stat, StatRow } from '@/components/app/stat'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { consentTredsReferral } from '../api'
import { cashKeys, cashQuery } from '../queries'

const TONE: Record<string, BadgeTone> = {
  paid_on_time: 'good',
  paid_late: 'warn',
  overdue: 'bad',
  due_soon: 'warn',
  open: 'neutral',
}

/** Payment clock against the 45-day MSMED limit, schemes the plant qualifies for, and TReDS referral. */
export function CashPage() {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const refer = useServerFn(consentTredsReferral)
  const { data } = useSuspenseQuery(cashQuery())
  const mutation = useMutation({
    mutationFn: () => refer({ data: { partner: 'treds' } }),
    onSuccess: () => {
      toast.success(t('cash.referred'))
      void queryClient.invalidateQueries({ queryKey: cashKeys.all })
    },
    onError: (error) => toastError(t, error),
  })
  return (
    <>
      <PageHeader title={t('nav.cash')} meta={t('cash.meta')} />
      <StatRow className="mb-4 lg:grid-cols-3">
        <Stat label={t('cash.outstanding')} value={f.money(data.outstanding, data.currency)} />
        <Stat
          label={t('cash.overdue')}
          value={data.overdue}
          tone={data.overdue > 0 ? 'bad' : 'good'}
        />
        <Stat label={t('cash.limit')} value={t('cash.days', { n: 45 })} hint={t('cash.msmed')} />
      </StatRow>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader title={t('cash.invoices')} />
          <ul className="divide-y divide-line">
            {data.invoices.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs">{i.number}</p>
                  <p className="text-xs text-muted">
                    {i.buyerName} · {f.money(i.amount, i.currency)}
                  </p>
                </div>
                <Badge tone={TONE[i.clock.status] ?? 'neutral'}>
                  {t(`cash.status.${i.clock.status}`, { day: i.clock.day, limit: i.clock.limit })}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title={t('cash.schemes')} description={t('cash.schemesHint')} />
            <ul className="divide-y divide-line">
              {data.schemes.map((s) => (
                <li key={s.id} className="px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {s.eligible ? (
                      <CircleCheck className="size-4 text-good" aria-hidden />
                    ) : (
                      <CircleX className="size-4 text-muted" aria-hidden />
                    )}
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{s.benefit}</p>
                  <ul className="mt-1 text-xs">
                    {s.reasons.map((r) => (
                      <li key={r.rule} className={r.ok ? 'text-good' : 'text-bad'}>
                        {r.ok ? '✓' : '✗'} {r.rule}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title={t('cash.treds')} description={t('cash.tredsHint')} />
            <CardBody>
              {data.referred ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-good">
                  <Check className="size-4" aria-hidden />
                  {t('cash.referred')}
                </p>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                >
                  {t('cash.refer')}
                </Button>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
