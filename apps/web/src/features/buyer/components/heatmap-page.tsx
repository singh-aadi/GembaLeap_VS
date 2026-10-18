import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Factory } from 'lucide-react'
import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { useT } from '@/lib/i18n'
import { heatmapQuery } from '../queries'
import { HeatmapFilters } from './heatmap-filters'
import { HeatmapGrid } from './heatmap-grid'
import { HeatmapTable } from './heatmap-table'

const route = getRouteApi('/b/suppliers/')

export function HeatmapPage() {
  const t = useT()
  const search = route.useSearch()
  const { data } = useSuspenseQuery(heatmapQuery(search))
  return (
    <>
      <PageHeader
        title={t('nav.suppliers')}
        meta={t('heatmap.meta', { count: data.rows.length, buyer: data.buyerName })}
      />
      <HeatmapFilters sectors={data.sectors} />
      {data.rows.length === 0 ? (
        <EmptyState icon={Factory} title={t('heatmap.empty')} />
      ) : search.view === 'grid' ? (
        <HeatmapGrid rows={data.rows} />
      ) : (
        <HeatmapTable rows={data.rows} />
      )}
      <p className="mt-4 text-xs text-muted">{t('heatmap.consentNote')}</p>
    </>
  )
}
