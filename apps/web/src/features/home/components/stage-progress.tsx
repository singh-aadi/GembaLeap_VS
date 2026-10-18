import { Progress } from '@/components/ui/progress'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import type { SupplierHome } from '../queries'

export function StageProgress({ stages }: { stages: SupplierHome['checklist']['stages'] }) {
  const t = useT()
  const pick = useLocalized()
  return (
    <ul className="space-y-3">
      {stages.map((stage) => (
        <li key={stage.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
          <span className="truncate text-sm">{pick(stage.name)}</span>
          <span className="text-xs text-muted tabular-nums">
            {stage.done}/{stage.scheduled}
          </span>
          <Progress
            className="col-span-2"
            value={stage.done}
            max={stage.scheduled}
            label={t('checklist.progressFor', { stage: pick(stage.name) })}
          />
        </li>
      ))}
    </ul>
  )
}
