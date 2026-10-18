import { SourcingFilters } from '@gembaleap/schemas'
import { createFileRoute } from '@tanstack/react-router'
import { SourcingPage } from '@/features/buyer/components/sourcing-page'
import { sourcingQuery } from '@/features/buyer/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/b/sourcing')({
  validateSearch: SourcingFilters.catch({}),
  loaderDeps: ({ search }) => search,
  beforeLoad: guard('/b/sourcing'),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(sourcingQuery(deps)),
  component: SourcingPage,
})
