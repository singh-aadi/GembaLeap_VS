import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

/** Toggle codes from the site's catalogue. At most five per event. */
export function CodePicker({
  catalogue,
  value,
  onChange,
}: {
  catalogue: string[]
  value: string[]
  onChange: (codes: string[]) => void
}) {
  const t = useT()
  return (
    <div role="group" aria-label={t('event.codes')} className="flex flex-wrap gap-2">
      {catalogue.map((code) => {
        const selected = value.includes(code)
        return (
          <button
            key={code}
            type="button"
            aria-pressed={selected}
            disabled={!selected && value.length >= 5}
            onClick={() => onChange(selected ? value.filter((c) => c !== code) : [...value, code])}
            className={cn(
              'inline-flex h-9 items-center rounded-full border px-3 font-mono text-xs',
              selected
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line bg-surface text-ink',
            )}
          >
            {code}
          </button>
        )
      })}
    </div>
  )
}
