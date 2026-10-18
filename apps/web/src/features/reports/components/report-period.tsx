import { Badge } from '@/components/ui/badge'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'

export function ReportPeriod({
  period,
  start,
  end,
}: {
  period: 'daily' | 'weekly'
  start: string
  end: string
}) {
  const t = useT()
  const f = useFormat()
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge tone={period === 'weekly' ? 'accent' : 'neutral'}>
        {t(`report.period.${period}`)}
      </Badge>
      <span className="tabular-nums">
        {period === 'daily' ? f.day(start) : `${f.day(start)} – ${f.day(end)}`}
      </span>
    </span>
  )
}

export function ReportStatus({ status }: { status: 'draft' | 'published' }) {
  const t = useT()
  return status === 'published' ? (
    <Badge tone="good">{t('report.status.published')}</Badge>
  ) : (
    <Badge tone="warn">{t('ai.draft')}</Badge>
  )
}
