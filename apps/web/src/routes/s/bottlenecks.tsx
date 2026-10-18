import { createFileRoute } from '@tanstack/react-router'
import { BottlenecksPage } from '@/features/bottlenecks/components/bottlenecks-page'
import { bottleneckListQuery } from '@/features/bottlenecks/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/bottlenecks')({
  beforeLoad: guard('/s/bottlenecks'),
  loader: ({ context }) => context.queryClient.ensureQueryData(bottleneckListQuery()),
  component: BottlenecksPage,
})
