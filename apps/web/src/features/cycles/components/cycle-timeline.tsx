import { cn } from '@/lib/cn'
import { useFormat } from '@/lib/format'
import { useT, type MessageId } from '@/lib/i18n'
import type { CycleDetail } from '../queries'

export function CycleTimeline({
  cycle,
  timeZone,
}: {
  cycle: CycleDetail['cycle']
  timeZone: string
}) {
  const t = useT()
  const f = useFormat()
  const steps: Array<{ label: MessageId; at?: string; done: boolean }> = [
    { label: 'cycle.step.opened', at: cycle.openedAt, done: true },
    { label: 'cycle.step.fixed', at: cycle.fixAppliedAt, done: Boolean(cycle.fixAppliedAt) },
    {
      label: 'cycle.step.verifying',
      done: cycle.status === 'verifying' || cycle.status === 'closed',
    },
    { label: 'cycle.step.closed', at: cycle.closedAt, done: cycle.status === 'closed' },
  ]
  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((step, i) => (
        <li key={step.label} className="min-w-0">
          <div className={cn('h-1.5 rounded-full', step.done ? 'bg-accent' : 'bg-subtle')} />
          <p
            className={cn(
              'mt-2 truncate text-xs font-medium',
              step.done ? 'text-ink' : 'text-muted',
            )}
          >
            {i + 1}. {t(step.label)}
          </p>
          <p className="text-xs text-muted tabular-nums">
            {step.at
              ? f.date(step.at, timeZone)
              : i === 3
                ? t('cycle.dueBy', { date: f.date(cycle.dueAt, timeZone) })
                : ''}
          </p>
        </li>
      ))}
    </ol>
  )
}
