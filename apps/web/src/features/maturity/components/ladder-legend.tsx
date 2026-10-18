import { LevelChip } from '@/components/app/ladder-bar'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { ladderBody, ladderName, LEVELS } from '@/lib/ladder'

export function LadderLegend({ current }: { current: number }) {
  const t = useT()
  return (
    <ol className="space-y-2">
      {LEVELS.map((level) => (
        <li
          key={level}
          className={cn('flex gap-3 rounded-lg p-2', level === current && 'bg-accent-soft')}
        >
          <LevelChip level={level} />
          <div className="min-w-0 text-sm">
            <p className="font-medium">{t(ladderName(level))}</p>
            <p className="text-xs text-muted">{t(ladderBody(level))}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
