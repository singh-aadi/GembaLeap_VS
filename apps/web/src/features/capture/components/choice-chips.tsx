import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

type Choice<T extends string> = { value: T; label: string; icon?: LucideIcon }

/** Single-select chips that scroll sideways on phones. */
export function ChoiceChips<T extends string>({
  label,
  choices,
  value,
  onChange,
}: {
  label: string
  choices: Choice<T>[]
  value: T | undefined
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-medium text-muted">{label}</legend>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {choices.map((choice) => {
          const selected = choice.value === value
          return (
            <button
              key={choice.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(choice.value)}
              className={cn(
                'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm',
                selected
                  ? 'border-accent bg-accent-soft font-medium text-accent'
                  : 'border-line bg-surface text-ink',
              )}
            >
              {choice.icon ? <choice.icon className="size-4" aria-hidden /> : null}
              {choice.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
