/** Horizontal bars for a short ranked list (loss Pareto). Values labelled, no axis. */
export function BarList({
  rows,
  format,
}: {
  rows: Array<{ label: string; value: number }>
  format: (value: number) => string
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{row.label}</span>
            <span className="shrink-0 text-xs text-muted tabular-nums">{format(row.value)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-subtle">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
