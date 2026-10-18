import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Table, Td, Th } from '@/components/ui/table'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { openCycle } from '../api'
import { bottleneckKeys, bottleneckListQuery, type BottleneckRow } from '../queries'

function CycleAction({
  row,
  canOpen,
  onOpen,
  pending,
}: {
  row: BottleneckRow
  canOpen: boolean
  onOpen: () => void
  pending: boolean
}) {
  const t = useT()
  if (row.cycleId) {
    return (
      <Link
        to="/s/cycles/$cycleId"
        params={{ cycleId: row.cycleId }}
        className="inline-flex h-11 items-center gap-1 text-sm font-medium whitespace-nowrap text-accent"
      >
        {t(`cycle.status.${row.cycleStatus ?? 'open'}`)}
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    )
  }
  return canOpen ? (
    <Button onClick={onOpen} disabled={pending}>
      {t('bottleneck.openCycle')}
    </Button>
  ) : null
}

export function BottlenecksPage() {
  const t = useT()
  const f = useFormat()
  const pick = useLocalized()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const open = useServerFn(openCycle)
  const { data } = useSuspenseQuery(bottleneckListQuery())

  const mutation = useMutation({
    mutationFn: (id: string) => open({ data: { id } }),
    onSuccess: async ({ id }) => {
      await queryClient.invalidateQueries({ queryKey: bottleneckKeys.all })
      await navigate({ to: '/s/cycles/$cycleId', params: { cycleId: id } })
    },
    onError: (error) => toastError(t, error),
  })

  return (
    <>
      <PageHeader title={t('nav.bottlenecks')} meta={t('bottleneck.meta')} />
      <Card className="mb-4">
        <CardHeader title={t('bottleneck.how')} description={t('bottleneck.how.hint')} />
        <CardBody>
          <p className="overflow-x-auto rounded-md bg-subtle px-3 py-2 font-mono text-xs whitespace-nowrap">
            priority = loss₃₀ × |λ(factor)| × (1 + recurrence) ÷ effort
          </p>
        </CardBody>
      </Card>
      <Card className="hidden md:block">
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>{t('bottleneck.problem')}</Th>
              <Th>{t('bottleneck.factor')}</Th>
              <Th className="text-right">{t('bottleneck.loss')}</Th>
              <Th className="text-right">{t('bottleneck.recurrence')}</Th>
              <Th className="text-right">{t('bottleneck.effort')}</Th>
              <Th className="text-right">{t('bottleneck.priority')}</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id} className={row.rank === 1 ? 'bg-accent-soft/40' : undefined}>
                <Td className="font-semibold tabular-nums">{row.rank}</Td>
                <Td>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted">
                    {pick(row.stage)} · <span className="font-mono">{row.codes.join(', ')}</span>
                  </p>
                </Td>
                <Td>
                  {t(`factor.${row.factor}`)}{' '}
                  <span className="text-xs text-muted tabular-nums">
                    λ {f.number(row.loading, 3)}
                  </span>
                </Td>
                <Td className="text-right tabular-nums">
                  {t('common.minutes', { n: row.lossMinutes30d })}
                </Td>
                <Td className="text-right tabular-nums">{row.recurrence}</Td>
                <Td className="text-right tabular-nums">{row.effort}/5</Td>
                <Td className="text-right font-semibold tabular-nums">
                  {f.number(row.priority, 1)}
                </Td>
                <Td className="py-1 text-right">
                  <CycleAction
                    row={row}
                    canOpen={data.canOpen}
                    onOpen={() => mutation.mutate(row.id)}
                    pending={mutation.isPending}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <ul className="space-y-2 md:hidden">
        {data.rows.map((row) => (
          <li key={row.id} className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-subtle text-sm font-semibold tabular-nums">
                {row.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{row.title}</p>
                <p className="mt-0.5 text-xs text-muted">{pick(row.stage)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{t(`factor.${row.factor}`)}</Badge>
                  <Badge tone="outline">{t('common.minutes', { n: row.lossMinutes30d })}</Badge>
                  <Badge tone="outline">
                    {t('bottleneck.priorityShort', { value: f.number(row.priority, 0) })}
                  </Badge>
                </div>
                <div className="mt-2">
                  <CycleAction
                    row={row}
                    canOpen={data.canOpen}
                    onOpen={() => mutation.mutate(row.id)}
                    pending={mutation.isPending}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
