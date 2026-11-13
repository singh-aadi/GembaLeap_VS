import { createFileRoute } from '@tanstack/react-router'
import { PlantPage } from '@/features/coach/components/plant-page'
import { plantQuery } from '@/features/coach/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/c/plants/$siteId')({
  beforeLoad: guard('/c/plants'),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(plantQuery(params.siteId)),
  component: PlantPage,
})
