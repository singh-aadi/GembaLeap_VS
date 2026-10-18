import { createFileRoute } from '@tanstack/react-router'
import { CyclePage } from '@/features/cycles/components/cycle-page'
import { cycleDetailQuery } from '@/features/cycles/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/cycles/$cycleId')({
  beforeLoad: guard('/s/cycles'),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(cycleDetailQuery(params.cycleId)),
  component: CyclePage,
})
