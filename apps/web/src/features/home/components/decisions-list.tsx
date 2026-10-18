import { Link } from '@tanstack/react-router'
import { ChevronRight, CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/app/empty-state'
import { Card, CardHeader } from '@/components/ui/card'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { SupplierHome } from '../queries'

function Row({ children, to }: { children: ReactNode; to: ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1 text-sm">{children}</div>
      {to}
    </li>
  )
}

const linkClass = 'inline-flex h-11 shrink-0 items-center gap-1 text-sm font-medium text-accent'

/** Everything waiting on a person. AI drafts nothing here that reaches the buyer without approval. */
export function DecisionsList({ decisions }: { decisions: SupplierHome['decisions'] }) {
  const t = useT()
  const f = useFormat()
  const open = (label: string) => (
    <>
      {label}
      <ChevronRight className="size-4" aria-hidden />
    </>
  )
  return (
    <Card>
      <CardHeader title={t('home.decisions')} description={t('home.decisions.hint')} />
      {decisions.length === 0 ? (
        <EmptyState icon={CircleCheck} title={t('home.decisions.none')} />
      ) : (
        <ul className="divide-y divide-line">
          {decisions.map((d) => {
            switch (d.kind) {
              case 'report':
                return (
                  <Row
                    key="report"
                    to={
                      <Link
                        to="/s/reports/$reportId"
                        params={{ reportId: d.id }}
                        className={linkClass}
                      >
                        {open(t('common.review'))}
                      </Link>
                    }
                  >
                    {t(
                      d.period === 'weekly'
                        ? 'home.decision.weeklyReport'
                        : 'home.decision.dailyReport',
                      { start: f.day(d.start), end: f.day(d.end) },
                    )}
                  </Row>
                )
              case 'eightD':
                return (
                  <Row
                    key="8d"
                    to={
                      <Link to="/s/ncr/$ncrId" params={{ ncrId: d.id }} className={linkClass}>
                        {open(t('common.review'))}
                      </Link>
                    }
                  >
                    {t('home.decision.eightD', { number: d.number })}
                  </Row>
                )
              case 'passport':
                return (
                  <Row
                    key="passport"
                    to={
                      <Link to="/s/lots/$lotId" params={{ lotId: d.id }} className={linkClass}>
                        {open(t('common.fix'))}
                      </Link>
                    }
                  >
                    {t('home.decision.passport', { lot: d.lotNo })}
                  </Row>
                )
              case 'events':
                return (
                  <Row
                    key="events"
                    to={
                      <Link
                        to="/s/events"
                        search={{ status: 'draft', sort: 'time' }}
                        className={linkClass}
                      >
                        {open(t('common.review'))}
                      </Link>
                    }
                  >
                    {t('home.decision.events', { count: d.count })}
                  </Row>
                )
              case 'disputes':
                return (
                  <Row
                    key="disputes"
                    to={
                      <Link to="/s/maturity" className={linkClass}>
                        {open(t('common.open'))}
                      </Link>
                    }
                  >
                    {t('home.decision.disputes', { count: d.count })}
                  </Row>
                )
              case 'consent':
                return (
                  <Row
                    key="consent"
                    to={
                      <Link to="/s/sharing" className={linkClass}>
                        {open(t('common.open'))}
                      </Link>
                    }
                  >
                    {t('home.decision.consent', { buyer: d.buyer, days: d.days })}
                  </Row>
                )
            }
          })}
        </ul>
      )}
    </Card>
  )
}
