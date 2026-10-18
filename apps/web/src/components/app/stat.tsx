import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Compact figure with a label. Used in rows, not as hero tiles. */
export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'good' | 'warn' | 'bad'
}) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs text-muted">{label}</dt>
      <dd
        className={cn(
          'mt-1 text-xl font-semibold text-heading tabular-nums',
          tone === 'good' && 'text-good',
          tone === 'warn' && 'text-warn-ink',
          tone === 'bad' && 'text-bad',
        )}
      >
        {value}
      </dd>
      {hint ? <dd className="mt-0.5 truncate text-xs text-muted">{hint}</dd> : null}
    </div>
  )
}

export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3 lg:grid-cols-5',
        className,
      )}
    >
      {children}
    </dl>
  )
}
