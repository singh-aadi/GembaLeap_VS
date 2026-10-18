import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowRight, CircleCheck, Circle } from 'lucide-react'
import { BackLink } from '@/components/app/back-link'
import { EvidenceList } from '@/components/app/evidence-link'
import { LevelChip } from '@/components/app/ladder-bar'
import { PageHeader } from '@/components/app/page-header'
import { Stat } from '@/components/app/stat'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { cycleDetailQuery } from '../queries'
import { CloseCycleForm } from './close-cycle-form'
import { CycleTimeline } from './cycle-timeline'

const route = getRouteApi('/s/cycles/$cycleId')

export function CyclePage() {
  const t = useT()
  const f = useFormat()
  const pick = useLocalized()
  const { cycleId } = route.useParams()
  const { data } = useSuspenseQuery(cycleDetailQuery(cycleId))
  const { cycle, timeZone } = data

  return (
    <>
      <PageHeader
        back={<BackLink to="/s/bottlenecks">{t('nav.bottlenecks')}</BackLink>}
        title={cycle.title}
        meta={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone={cycle.status === 'closed' ? 'good' : 'accent'}>
              {t(`cycle.status.${cycle.status}`)}
            </Badge>
            {pick(data.stage)}
            <span className="inline-flex items-center gap-1">
              <LevelChip level={cycle.fromLevel} />
              <ArrowRight className="size-4" aria-hidden />
              <LevelChip level={cycle.targetLevel} />
            </span>
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <CardBody>
              <CycleTimeline cycle={cycle} timeZone={timeZone} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title={t('cycle.plan')} />
            <ul className="divide-y divide-line">
              {cycle.plan.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted">{t('cycle.noPlan')}</li>
              ) : null}
              {cycle.plan.map((step) => (
                <li key={step.id} className="flex gap-3 px-4 py-3">
                  {step.done ? (
                    <CircleCheck
                      className="size-5 shrink-0 text-good"
                      aria-label={t('common.done')}
                    />
                  ) : (
                    <Circle
                      className="size-5 shrink-0 text-muted"
                      aria-label={t('common.notDone')}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm">{step.text}</p>
                    <p className="text-xs text-muted">
                      {step.owner} · {t('cycle.due', { date: f.date(step.dueAt, timeZone) })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title={t('cycle.before')} />
              <CardBody>
                <EvidenceList
                  ids={cycle.beforeEvidenceIds}
                  evidence={data.evidence}
                  timeZone={timeZone}
                />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title={t('cycle.after')} />
              <CardBody>
                {cycle.verificationEvidenceIds.length > 0 ? (
                  <EvidenceList
                    ids={cycle.verificationEvidenceIds}
                    evidence={data.evidence}
                    timeZone={timeZone}
                  />
                ) : (
                  <p className="text-sm text-muted">{t('cycle.noAfter')}</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader title={t('cycle.measure')} description={cycle.baseline.metric} />
            <CardBody>
              <dl className="grid grid-cols-2 gap-3">
                <Stat
                  label={t('cycle.baseline')}
                  value={`${cycle.baseline.value}`}
                  hint={cycle.baseline.unit}
                />
                <Stat
                  label={t('cycle.result')}
                  value={cycle.result ? `${cycle.result.value}` : '—'}
                  hint={cycle.baseline.unit}
                  tone={
                    cycle.result && cycle.result.value < cycle.baseline.value ? 'good' : undefined
                  }
                />
              </dl>
            </CardBody>
          </Card>
          {data.ncrs.length > 0 ? (
            <Card>
              <CardHeader title={t('cycle.linkedNcrs')} />
              <ul className="divide-y divide-line">
                {data.ncrs.map((ncr) => (
                  <li key={ncr.id}>
                    <Link
                      to="/s/ncr/$ncrId"
                      params={{ ncrId: ncr.id }}
                      className="flex h-12 items-center justify-between px-4 text-sm hover:bg-subtle/60"
                    >
                      <span className="font-mono">{ncr.number}</span>
                      <Badge>{t(`ncr.status.${ncr.status}`)}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          {cycle.status !== 'closed' && data.canClose ? (
            <CloseCycleForm cycle={cycle} timeZone={timeZone} />
          ) : null}
        </div>
      </div>
    </>
  )
}
