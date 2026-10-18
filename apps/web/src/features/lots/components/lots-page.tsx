import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { StatusBadge } from '@/components/app/status-badge'
import { Card } from '@/components/ui/card'
import { Table, Td, Th } from '@/components/ui/table'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { lotListQuery } from '../queries'

export function LotsPage() {
  const t = useT()
  const f = useFormat()
  const { data } = useSuspenseQuery(lotListQuery())
  return (
    <>
      <PageHeader title={t('nav.lots')} meta={t('passport.listHint')} />
      <Card className="hidden sm:block">
        <Table>
          <thead>
            <tr>
              <Th>{t('passport.lotNo')}</Th>
              <Th>{t('passport.part')}</Th>
              <Th>{t('passport.po')}</Th>
              <Th className="text-right">{t('passport.qty')}</Th>
              <Th>{t('passport.heat')}</Th>
              <Th>{t('passport.passport')}</Th>
              <Th>{t('passport.shipped')}</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((lot) => (
              <tr key={lot.id} className="hover:bg-subtle/60">
                <Td>
                  <Link
                    to="/s/lots/$lotId"
                    params={{ lotId: lot.id }}
                    className="font-mono text-xs font-medium text-accent hover:underline"
                  >
                    {lot.lotNo}
                  </Link>
                </Td>
                <Td>
                  <span className="block font-mono text-xs">{lot.partNo}</span>
                  <span className="text-xs text-muted">{lot.partName}</span>
                </Td>
                <Td className="font-mono text-xs">{lot.poNumber}</Td>
                <Td className="text-right tabular-nums">{f.number(lot.qty)}</Td>
                <Td className="font-mono text-xs">{lot.heatNo ?? '—'}</Td>
                <Td>
                  <StatusBadge
                    status={lot.overall}
                    label={t(`passport.status.${lot.passportStatus}`)}
                  />
                </Td>
                <Td className="text-xs text-muted">
                  {lot.shippedAt ? f.date(lot.shippedAt) : '—'}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <ul className="space-y-2 sm:hidden">
        {data.map((lot) => (
          <li key={lot.id}>
            <Link
              to="/s/lots/$lotId"
              params={{ lotId: lot.id }}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-medium">{lot.lotNo}</p>
                <p className="truncate text-xs text-muted">
                  {lot.partNo} · {f.number(lot.qty)} pcs
                </p>
                <div className="mt-2">
                  <StatusBadge
                    status={lot.overall}
                    label={t(`passport.status.${lot.passportStatus}`)}
                  />
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
