/** 12-point trend line, no axes. Values on the 0–5 ladder scale. */
export function Sparkline({
  values,
  label,
  max = 5,
}: {
  values: number[]
  label: string
  max?: number
}) {
  const width = 72
  const height = 20
  const lo = Math.max(0, Math.min(...values) - 0.3)
  const hi = Math.min(max, Math.max(...values) + 0.3)
  const span = hi - lo || 1
  const points = values
    .map(
      (v, i) =>
        `${((i / Math.max(1, values.length - 1)) * width).toFixed(1)},${(height - ((v - lo) / span) * height).toFixed(1)}`,
    )
    .join(' ')
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--gl-accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
