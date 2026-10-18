import { Link } from '@tanstack/react-router'
import { Card, CardHeader } from '@/components/ui/card'
import { EventStatusBadge, EventTypeBadge } from '@/features/events/components/event-type-badge'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { SupplierHome } from '../queries'

export function RecentEvents({
  events,
  timeZone,
}: {
  events: SupplierHome['recentEvents']
  timeZone: string
}) {
  const t = useT()
  const f = useFormat()
  return (
    <Card>
      <CardHeader
        title={t('home.recentEvents')}
        action={
          <Link to="/s/events" className="text-sm text-accent hover:underline">
            {t('common.viewAll')}
          </Link>
        }
      />
      <ul className="divide-y divide-line">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              to="/s/events/$eventId"
              params={{ eventId: event.id }}
              className="block px-4 py-3 hover:bg-subtle/60"
            >
              <div className="flex flex-wrap items-center gap-2">
                <EventTypeBadge type={event.type} />
                {event.status === 'draft' ? <EventStatusBadge status="draft" /> : null}
                <span className="ml-auto text-xs text-muted tabular-nums">
                  {f.dateTime(event.createdAt, timeZone)}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-ink">{event.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
