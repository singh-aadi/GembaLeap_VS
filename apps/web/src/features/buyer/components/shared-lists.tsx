import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/app/status-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { ReportPeriod } from '@/features/reports/components/report-period'
import { useT } from '@/lib/i18n'
import type { SupplierDetail } from '../queries'

function Empty() {
  return <p className="px-4 py-3 text-sm text-muted">{useT()('supplier.nothingYet')}</p>
}

const row = 'flex min-h-12 items-center gap-3 px-4 py-2 text-sm hover:bg-subtle/60'

/** Whatever the consent covers: reports, sealed passports, improvement cycles, NCRs. */
export function SharedLists({ data }: { data: SupplierDetail }) {
  const t = useT()
  return (
    <>
      {data.reports ? (
        <Card>
          <CardHeader title={t('nav.reports')} />
          {data.reports.length === 0 ? <Empty /> : null}
          <ul className="divide-y divide-line">
            {data.reports.map((r) => (
              <li key={r.id}>
                <Link to="/b/reports/$reportId" params={{ reportId: r.id }} className={row}>
                  <span className="flex-1">
                    <ReportPeriod period={r.period} start={r.periodStart} end={r.periodEnd} />
                  </span>
                  <span className="text-xs text-muted tabular-nums">
                    {r.checksDone}/{r.checksDue}
                    {r.outOfLimit > 0 ? (
                      <span className="ml-2 font-medium text-bad">
                        {t('report.oolShort', { count: r.outOfLimit })}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight className="size-4 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {data.passports ? (
        <Card>
          <CardHeader title={t('supplier.passports')} />
          {data.passports.length === 0 ? <Empty /> : null}
          <ul className="divide-y divide-line">
            {data.passports.map((p) => (
              <li key={p.lotId}>
                <Link to="/b/passports/$lotId" params={{ lotId: p.lotId }} className={row}>
                  <span className="flex-1">
                    <span className="font-mono text-xs font-medium">{p.lotNo}</span>
                    <span className="ml-2 text-xs text-muted">{p.partNo}</span>
                  </span>
                  <StatusBadge status={p.overall} label={t(`result.${p.overall}`)} />
                  <ChevronRight className="size-4 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {data.cycles ? (
        <Card>
          <CardHeader title={t('supplier.cycles')} />
          {data.cycles.length === 0 ? <Empty /> : null}
          <ul className="divide-y divide-line">
            {data.cycles.map((c) => (
              <li key={c.id} className="flex min-h-12 items-center gap-3 px-4 py-2 text-sm">
                <span className="flex-1">{c.title}</span>
                <span className="text-xs text-muted">
                  L{c.fromLevel} → L{c.targetLevel}
                </span>
                <Badge tone={c.status === 'closed' ? 'good' : 'accent'}>
                  {t(`cycle.status.${c.status}`)}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {data.ncrs.length > 0 ? (
        <Card>
          <CardHeader title={t('nav.ncr')} />
          <ul className="divide-y divide-line">
            {data.ncrs.map((n) => (
              <li key={n.id}>
                <Link to="/b/ncr/$ncrId" params={{ ncrId: n.id }} className={row}>
                  <span className="font-mono text-xs text-muted">{n.number}</span>
                  <span className="flex-1 truncate">{n.title}</span>
                  <Badge>{t(`ncr.status.${n.status}`)}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  )
}
