import { Link } from '@tanstack/react-router'
import { ChevronRight, Eye, Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Table, Td, Th } from '@/components/ui/table'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { ReportSummary } from '../queries'
import { ReportPeriod, ReportStatus } from './report-period'

type Side = 'supplier' | 'buyer'

function ReportLink({
  side,
  id,
  children,
  className,
}: {
  side: Side
  id: string
  children: React.ReactNode
  className?: string
}) {
  return side === 'supplier' ? (
    <Link to="/s/reports/$reportId" params={{ reportId: id }} className={className}>
      {children}
    </Link>
  ) : (
    <Link to="/b/reports/$reportId" params={{ reportId: id }} className={className}>
      {children}
    </Link>
  )
}

export function ReportsList({ reports, side }: { reports: ReportSummary[]; side: Side }) {
  const t = useT()
  const f = useFormat()
  return (
    <>
      <Card className="hidden sm:block">
        <Table>
          <thead>
            <tr>
              <Th>{t('report.col.period')}</Th>
              {side === 'buyer' ? <Th>{t('report.col.supplier')}</Th> : null}
              <Th>{t('report.col.status')}</Th>
              <Th className="text-right">{t('report.col.checks')}</Th>
              <Th className="text-right">{t('report.col.ool')}</Th>
              <Th className="text-right">{t('report.col.ftr')}</Th>
              <Th>{t('report.col.seal')}</Th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-subtle/60">
                <Td>
                  <ReportLink side={side} id={r.id} className="hover:text-accent">
                    <ReportPeriod period={r.period} start={r.periodStart} end={r.periodEnd} />
                  </ReportLink>
                </Td>
                {side === 'buyer' ? <Td>{r.supplierName}</Td> : null}
                <Td>
                  <span className="inline-flex items-center gap-2">
                    <ReportStatus status={r.status} />
                    {side === 'supplier' && r.viewed ? (
                      <Eye className="size-4 text-muted" aria-label={t('report.viewedByBuyer')} />
                    ) : null}
                  </span>
                </Td>
                <Td className="text-right tabular-nums">
                  {r.checksDone}/{r.checksDue}{' '}
                  <span className="text-muted">({f.percent(r.checksDone / r.checksDue, 1)})</span>
                </Td>
                <Td
                  className={
                    r.outOfLimit > 0
                      ? 'text-right font-medium text-bad tabular-nums'
                      : 'text-right tabular-nums'
                  }
                >
                  {r.outOfLimit}
                </Td>
                <Td className="text-right tabular-nums">
                  {r.lotsFirstTimeRight}/{r.lotsShipped}
                </Td>
                <Td className="font-mono text-xs text-muted">
                  {r.sealHash ? `${r.sealHash.slice(0, 10)}…` : '—'}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <ul className="space-y-2 sm:hidden">
        {reports.map((r) => (
          <li key={r.id}>
            <ReportLink
              side={side}
              id={r.id}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <ReportPeriod period={r.period} start={r.periodStart} end={r.periodEnd} />
                  <ReportStatus status={r.status} />
                </div>
                {side === 'buyer' ? <p className="mt-1 text-sm">{r.supplierName}</p> : null}
                <p className="mt-1 flex items-center gap-1 text-xs text-muted tabular-nums">
                  {t('report.cardLine', {
                    done: r.checksDone,
                    due: r.checksDue,
                    ool: r.outOfLimit,
                  })}
                  {r.sealHash ? (
                    <Lock className="ml-1 size-3" aria-label={t('report.sealed')} />
                  ) : null}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
            </ReportLink>
          </li>
        ))}
      </ul>
    </>
  )
}
