import { EventFilters } from '@gembaleap/schemas'
import { createFileRoute } from '@tanstack/react-router'
import { EventsPage } from '@/features/events/components/events-page'
import { eventListQuery } from '@/features/events/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/events/')({
  validateSearch: EventFilters.catch({ sort: 'time' }),
  loaderDeps: ({ search }) => search,
  beforeLoad: guard('/s/events'),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(eventListQuery(deps)),
  component: EventsPage,
})
