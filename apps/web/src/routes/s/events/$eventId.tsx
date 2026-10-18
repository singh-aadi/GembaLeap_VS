import { createFileRoute } from '@tanstack/react-router'
import { EventDetail } from '@/features/events/components/event-detail'
import { eventDetailQuery } from '@/features/events/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/events/$eventId')({
  beforeLoad: guard('/s/events'),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(eventDetailQuery(params.eventId)),
  component: EventDetail,
})
