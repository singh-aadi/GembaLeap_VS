import { Progress } from '@/components/ui/progress'
import { useT } from '@/lib/i18n'
import type { Checklist } from '../queries'

export function ChecklistSummary({ summary }: { summary: Checklist['summary'] }) {
  const t = useT()
  const ratio = summary.dueSoFar === 0 ? 1 : summary.done / summary.dueSoFar
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm">
          <span className="text-xl font-semibold text-heading tabular-nums">{summary.done}</span>
          <span className="text-muted"> / {summary.dueSoFar} </span>
          <span className="text-muted">{t('checklist.dueSoFar')}</span>
        </p>
        <p className="text-xs text-muted tabular-nums">
          {t('checklist.scheduledToday', { count: summary.scheduled })}
        </p>
      </div>
      <Progress
        className="mt-2"
        value={summary.done}
        max={summary.dueSoFar}
        label={t('checklist.progress')}
        tone={ratio >= 0.95 ? 'good' : ratio >= 0.8 ? 'accent' : 'warn'}
      />
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {summary.outOfLimit > 0 ? (
          <li className="font-medium text-bad">
            {t('checklist.outOfLimit', { count: summary.outOfLimit, contained: summary.contained })}
          </li>
        ) : null}
        {summary.overdue > 0 ? (
          <li className="font-medium text-warn-ink">
            {t('checklist.overdue', { count: summary.overdue })}
          </li>
        ) : null}
        {summary.due > 0 ? (
          <li className="font-medium text-accent">
            {t('checklist.dueNow', { count: summary.due })}
          </li>
        ) : null}
        <li className="text-muted">{t('checklist.later', { count: summary.upcoming })}</li>
      </ul>
    </div>
  )
}
