import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useFormat } from '@/lib/format'
import { useLocalized } from '@/lib/localized'
import { EventStatusBadge, EventTypeBadge } from './event-type-badge'
import type { EventRow } from './events-table'

/** Under 640 px the table becomes stacked cards. */
export function EventCards({ rows, timeZone }: { rows: EventRow[]; timeZone: string }) {
  const f = useFormat()
  const pick = useLocalized()
  return (
    <ul className="space-y-2 sm:hidden">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            to="/s/events/$eventId"
            params={{ eventId: row.id }}
            className="flex items-start gap-3 rounded-lg border border-line bg-surface p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <EventTypeBadge type={row.type} />
                <EventStatusBadge status={row.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-ink">{row.summary}</p>
              <p className="mt-1 text-xs text-muted tabular-nums">
                {f.dateTime(row.createdAt, timeZone)} · {pick(row.stage)}
                {row.lotNo ? <span className="font-mono"> · {row.lotNo}</span> : null}
              </p>
            </div>
            <ChevronRight className="mt-1 size-4 shrink-0 text-muted" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}
