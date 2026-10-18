import type { Level } from '@gembaleap/schemas'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

const LADDER = ['ladder-0', 'ladder-1', 'ladder-2', 'ladder-3', 'ladder-4', 'ladder-5'] as const

/** Six steps L0–L5; filled up to the current level, target marked with an outline. */
export function LadderBar({
  level,
  target,
  size = 'md',
}: {
  level: Level
  target?: Level
  size?: 'sm' | 'md'
}) {
  const t = useT()
  return (
    <div
      role="img"
      aria-label={t('ladder.aria', { level, target: target ?? level })}
      className={cn('flex items-end gap-0.5', size === 'sm' ? 'h-4' : 'h-6')}
    >
      {LADDER.map((cls, step) => (
        <span
          key={cls}
          className={cn(
            'w-2 rounded-sm',
            step <= level ? cls : 'bg-subtle',
            step === target && step > level && 'border border-dashed border-accent bg-transparent',
          )}
          style={{ height: `${((step + 1) / LADDER.length) * 100}%` }}
        />
      ))}
    </div>
  )
}

export function LevelChip({ level, className }: { level: Level; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 min-w-9 items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums',
        LADDER[level],
        level < 3 && 'text-heading',
        className,
      )}
    >
      L{level}
    </span>
  )
}
