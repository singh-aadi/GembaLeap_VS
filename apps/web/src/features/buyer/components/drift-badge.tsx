import type { Drift } from '@gembaleap/schemas'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/lib/i18n'

export function DriftBadge({ drift }: { drift: Drift }) {
  const t = useT()
  if (drift === 'improving')
    return (
      <Badge tone="good">
        <TrendingUp aria-hidden />
        {t('drift.improving')}
      </Badge>
    )
  if (drift === 'drifting')
    return (
      <Badge tone="bad">
        <TrendingDown aria-hidden />
        {t('drift.drifting')}
      </Badge>
    )
  return (
    <Badge>
      <Minus aria-hidden />
      {t('drift.stable')}
    </Badge>
  )
}
