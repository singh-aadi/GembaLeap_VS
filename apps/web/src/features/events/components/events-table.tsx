import type { LocalizedText } from '@gembaleap/schemas'
import { createColumnHelper, FlexRender, tableFeatures, useTable } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Table, Td, Th } from '@/components/ui/table'
import { cn } from '@/lib/cn'
import { useFormat } from '@/lib/format'
import { useT, type MessageId } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { EventStatusBadge, EventTypeBadge } from './event-type-badge'

export type EventRow = {
  id: string
  createdAt: string
  stage: LocalizedText
  type: 'defect' | 'downtime' | 'material' | 'safety' | 'idea'
  codes: string[]
  summary: string
  lotNo?: string
  severity: number
  status: 'draft' | 'confirmed'
}

type Row = EventRow & { timeZone: string }

function Header({ id }: { id: MessageId }) {
  return <>{useT()(id)}</>
}

function TimeCell({ row }: { row: Row }) {
  const f = useFormat()
  return (
    <>
      <span className="block">{f.time(row.createdAt, row.timeZone)}</span>
      <span className="text-xs text-muted">{f.date(row.createdAt, row.timeZone)}</span>
    </>
  )
}

function StageCell({ stage }: { stage: LocalizedText }) {
  return <>{useLocalized()(stage)}</>
}

const features = tableFeatures({})
const helper = createColumnHelper<typeof features, Row>()
const columns = helper.columns([
  helper.accessor('createdAt', {
    header: () => <Header id="events.col.time" />,
    cell: ({ row }) => <TimeCell row={row.original} />,
    meta: { className: 'whitespace-nowrap tabular-nums' },
  }),
  helper.accessor('stage', {
    header: () => <Header id="events.col.stage" />,
    cell: ({ getValue }) => <StageCell stage={getValue()} />,
    meta: { className: 'max-w-40' },
  }),
  helper.accessor('type', {
    header: () => <Header id="events.col.type" />,
    cell: ({ row }) => (
      <>
        <EventTypeBadge type={row.original.type} />
        <span className="mt-1 block font-mono text-xs text-muted">
          {row.original.codes.join(', ')}
        </span>
      </>
    ),
  }),
  helper.accessor('summary', {
    header: () => <Header id="events.col.summary" />,
    cell: ({ row }) => (
      <Link
        to="/s/events/$eventId"
        params={{ eventId: row.original.id }}
        className="line-clamp-2 text-ink hover:text-accent"
      >
        {row.original.summary}
      </Link>
    ),
    meta: { className: 'max-w-md' },
  }),
  helper.accessor('lotNo', {
    header: () => <Header id="events.col.lot" />,
    cell: ({ getValue }) => getValue() ?? '—',
    meta: { className: 'font-mono text-xs whitespace-nowrap' },
  }),
  helper.accessor('severity', {
    header: () => <Header id="events.col.severity" />,
    cell: ({ getValue }) => (
      <span className={cn(getValue() >= 4 && 'font-semibold text-bad')}>{getValue()}</span>
    ),
    meta: { className: 'text-right tabular-nums' },
  }),
  helper.accessor('status', {
    header: () => <Header id="events.col.status" />,
    cell: ({ getValue }) => <EventStatusBadge status={getValue()} />,
  }),
])

function cellClass(meta: unknown): string | undefined {
  return typeof meta === 'object' &&
    meta !== null &&
    'className' in meta &&
    typeof meta.className === 'string'
    ? meta.className
    : undefined
}

/** Desktop table. Rows arrive filtered and sorted by the server; the table lays them out. */
export function EventsTable({ rows, timeZone }: { rows: EventRow[]; timeZone: string }) {
  const data = useMemo(() => rows.map((row) => ({ ...row, timeZone })), [rows, timeZone])
  const table = useTable({ features, columns, data })

  return (
    <Card className="hidden sm:block">
      <Table>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <Th key={header.id} className={cellClass(header.column.columnDef.meta)}>
                  {header.isPlaceholder ? null : <FlexRender header={header} />}
                </Th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-subtle/60">
              {row.getAllCells().map((cell) => (
                <Td key={cell.id} className={cellClass(cell.column.columnDef.meta)}>
                  <FlexRender cell={cell} />
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}
