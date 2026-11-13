import { SUTRA_LEVELS } from '@sutraos/schemas'
import { LevelChip } from '@/components/app/ladder-bar'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

const SHARE = ['~55%', '~25%', '~12%', '~6%', '~1.5%', '<0.5%']

/** The Sutra Maturity Ladder, top level first, with the plant's level highlighted. */
export function Ladder({ level }: { level: number }) {
  const t = useT()
  return (
    <ol className="space-y-1.5">
      {[...SUTRA_LEVELS].reverse().map((l) => (
        <li
          key={l.level}
          className={cn(
            'flex items-center gap-3 rounded-lg border px-3 py-2',
            l.level === level ? 'border-warn bg-warn-soft' : 'border-transparent bg-subtle',
          )}
          aria-current={l.level === level ? 'step' : undefined}
        >
          <LevelChip level={l.level} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{t(`sutra.level.${l.key}`)}</p>
            <p className="truncate text-xs text-muted">
              {t(`sutra.levelBody.${l.key}`)} · {t(`sutra.external.${l.external}`)}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted tabular-nums">{SHARE[l.level]}</span>
        </li>
      ))}
    </ol>
  )
}
