import { createFileRoute } from '@tanstack/react-router'
import { MaturityPage } from '@/features/maturity/components/maturity-page'
import { maturityQuery } from '@/features/maturity/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/maturity')({
  beforeLoad: guard('/s/maturity'),
  loader: ({ context }) => context.queryClient.ensureQueryData(maturityQuery()),
  component: MaturityPage,
})
