import { cn } from '@/lib/cn'

type ProgressProps = {
  value: number
  max: number
  label: string
  tone?: 'accent' | 'good' | 'warn' | 'bad'
  className?: string
}

const fill = { accent: 'bg-accent', good: 'bg-good', warn: 'bg-warn', bad: 'bg-bad' } as const

export function Progress({ value, max, label, tone = 'accent', className }: ProgressProps) {
  const ratio = max === 0 ? 0 : Math.min(1, value / max)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-subtle', className)}
    >
      <div className={cn('h-full rounded-full', fill[tone])} style={{ width: `${ratio * 100}%` }} />
    </div>
  )
}
