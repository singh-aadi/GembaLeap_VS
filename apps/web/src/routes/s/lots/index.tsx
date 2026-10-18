import { createFileRoute } from '@tanstack/react-router'
import { LotsPage } from '@/features/lots/components/lots-page'
import { lotListQuery } from '@/features/lots/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/lots/')({
  beforeLoad: guard('/s/lots'),
  loader: ({ context }) => context.queryClient.ensureQueryData(lotListQuery()),
  component: LotsPage,
})
