import { createFileRoute } from '@tanstack/react-router'
import { LevelPage } from '@/features/level/components/level-page'
import { levelQuery } from '@/features/level/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/level')({
  beforeLoad: guard('/s/level'),
  loader: ({ context }) => context.queryClient.ensureQueryData(levelQuery()),
  component: LevelPage,
})
