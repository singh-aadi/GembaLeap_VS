import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { LadderBar } from '@/components/app/ladder-bar'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { ChecklistSummary } from '@/features/checklist/components/checklist-summary'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { supplierHomeQuery } from '../queries'
import { DecisionsList } from './decisions-list'
import { RecentEvents } from './recent-events'
import { StageProgress } from './stage-progress'
import { TrustRecord } from './trust-record'

export function OwnerHome() {
  const t = useT()
  const f = useFormat()
  const { data } = useSuspenseQuery(supplierHomeQuery())
  return (
    <>
      <PageHeader
        title={data.siteName}
        meta={t('home.meta', { date: f.day(data.checklist.date), shift: 'A' })}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader
              title={t('home.builtInQuality')}
              description={t('home.builtInQuality.hint')}
              action={
                <Link
                  to="/s/checklist"
                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  {t('common.open')}
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              }
            />
            <CardBody className="grid gap-6 md:grid-cols-2">
              <ChecklistSummary summary={data.checklist.summary} />
              <StageProgress stages={data.checklist.stages} />
            </CardBody>
          </Card>
          <DecisionsList decisions={data.decisions} />
          <RecentEvents events={data.recentEvents} timeZone={data.timeZone} />
        </div>
        <div className="space-y-4">
          <TrustRecord buyers={data.buyers} />
          <Card>
            <CardHeader title={t('home.improvement')} />
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t('home.ladder')}</p>
                  <p className="mt-1 text-xl font-semibold text-heading tabular-nums">
                    L{data.ladder.level}{' '}
                    <span className="text-sm font-normal text-muted">
                      · {t('home.index', { index: f.number(data.ladder.index, 1) })}
                    </span>
                  </p>
                </div>
                <LadderBar level={data.ladder.level} target={data.ladder.level + 1} />
              </div>
              {data.topBottleneck ? (
                <div className="border-t border-line pt-3">
                  <p className="text-xs text-muted">{t('home.topBottleneck')}</p>
                  <p className="mt-1 text-sm">{data.topBottleneck.title}</p>
                  {data.topBottleneck.cycleId ? (
                    <Link
                      to="/s/cycles/$cycleId"
                      params={{ cycleId: data.topBottleneck.cycleId }}
                      className="mt-2 inline-flex h-11 items-center gap-1 text-sm font-medium text-accent"
                    >
                      {t('home.openCycle')}
                      <ChevronRight className="size-4" aria-hidden />
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
