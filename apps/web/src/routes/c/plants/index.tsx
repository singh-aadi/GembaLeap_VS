import { createFileRoute } from '@tanstack/react-router'
import { PlantsPage } from '@/features/coach/components/plants-page'
import { plantsQuery } from '@/features/coach/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/c/plants/')({
  beforeLoad: guard('/c/plants'),
  loader: ({ context }) => context.queryClient.ensureQueryData(plantsQuery()),
  component: PlantsPage,
})
