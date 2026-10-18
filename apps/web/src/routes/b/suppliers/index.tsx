import { HeatmapFilters } from '@gembaleap/schemas'
import { createFileRoute } from '@tanstack/react-router'
import { HeatmapPage } from '@/features/buyer/components/heatmap-page'
import { heatmapQuery } from '@/features/buyer/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/b/suppliers/')({
  validateSearch: HeatmapFilters.catch({ sort: 'risk', view: 'table' }),
  loaderDeps: ({ search }) => search,
  beforeLoad: guard('/b/suppliers'),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(heatmapQuery(deps)),
  component: HeatmapPage,
})
