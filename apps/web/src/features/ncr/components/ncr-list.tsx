import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronRight, FileWarning } from 'lucide-react'
import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { ncrListQuery } from '../queries'

export function NcrList({ side }: { side: 'supplier' | 'buyer' }) {
  const t = useT()
  const f = useFormat()
  const { data } = useSuspenseQuery(ncrListQuery())
  return (
    <>
      <PageHeader title={t('nav.ncr')} meta={t('ncr.listHint')} />
      <Card>
        {data.length === 0 ? (
          <EmptyState icon={FileWarning} title={t('ncr.none')} />
        ) : (
          <ul className="divide-y divide-line">
            {data.map((ncr) => {
              const body = (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-mono text-muted">{ncr.number}</span>
                      <span className="font-medium">{ncr.title}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {ncr.counterpart} · <span className="font-mono">{ncr.lotNo}</span> ·{' '}
                      {f.date(ncr.raisedAt)}
                    </p>
                  </div>
                  <Badge>{t(`ncr.status.${ncr.status}`)}</Badge>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </>
              )
              const className = 'flex items-center gap-3 px-4 py-3 hover:bg-subtle/60'
              return (
                <li key={ncr.id}>
                  {side === 'supplier' ? (
                    <Link to="/s/ncr/$ncrId" params={{ ncrId: ncr.id }} className={className}>
                      {body}
                    </Link>
                  ) : (
                    <Link to="/b/ncr/$ncrId" params={{ ncrId: ncr.id }} className={className}>
                      {body}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}
