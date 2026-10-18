import type { ScoreState } from '@gembaleap/schemas'
import { CircleAlert, CircleCheck, CircleDashed } from 'lucide-react'
import { useT } from '@/lib/i18n'

export function ScoreStateIcon({ state }: { state: ScoreState }) {
  const t = useT()
  const label = t(`score.state.${state}`)
  if (state === 'accepted') return <CircleCheck className="size-3.5 text-good" aria-label={label} />
  if (state === 'disputed') return <CircleAlert className="size-3.5 text-bad" aria-label={label} />
  return <CircleDashed className="size-3.5 text-warn-ink" aria-label={label} />
}
