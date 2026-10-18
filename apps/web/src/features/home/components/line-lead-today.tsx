import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Camera, ChevronRight, FileClock } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { ChecklistSummary } from '@/features/checklist/components/checklist-summary'
import { SlotStatusIcon, SlotStatusLabel } from '@/features/checklist/components/slot-status'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { supplierHomeQuery } from '../queries'
import { RecentEvents } from './recent-events'

/** The line lead's shift at a glance: what is due next, one tap to capture. */
export function LineLeadToday() {
  const t = useT()
  const f = useFormat()
  const pick = useLocalized()
  const { data } = useSuspenseQuery(supplierHomeQuery())
  return (
    <>
      <PageHeader
        title={t('today.title')}
        meta={t('home.meta', { date: f.day(data.checklist.date), shift: 'A' })}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t('nav.checklist')} />
          <CardBody>
            <ChecklistSummary summary={data.checklist.summary} />
          </CardBody>
          <ul className="divide-y divide-line border-t border-line">
            {data.nextChecks.map((check) => (
              <li
                key={`${check.itemId}-${check.slot}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <SlotStatusIcon status={check.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{pick(check.label)}</p>
                  <p className="text-xs text-muted">
                    {check.slot} · {pick(check.stage)} · <SlotStatusLabel status={check.status} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-line p-4">
            <Button asChild className="w-full">
              <Link to="/s/checklist">
                {t('today.openChecklist')}
                <ChevronRight aria-hidden />
              </Link>
            </Button>
          </div>
        </Card>
        <div className="space-y-4">
          <Button asChild variant="primary" className="h-14 w-full text-base">
            <Link to="/s/capture">
              <Camera aria-hidden />
              {t('today.capture')}
            </Link>
          </Button>
          {data.brief ? (
            <Link
              to="/s/shift-brief"
              className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 hover:bg-subtle/60"
            >
              <FileClock className="size-5 text-teal" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t('today.brief')}</p>
                <p className="text-xs text-muted">
                  {t('today.briefAt', { time: f.time(data.brief, data.timeZone) })}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted" aria-hidden />
            </Link>
          ) : null}
          <RecentEvents events={data.recentEvents} timeZone={data.timeZone} />
        </div>
      </div>
    </>
  )
}
