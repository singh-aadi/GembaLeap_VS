import type { EventType } from '@gembaleap/schemas'
import { CircleX, Clock, Lightbulb, Package, ShieldAlert, type LucideIcon } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { useT } from '@/lib/i18n'

const STYLE: Record<EventType, { icon: LucideIcon; tone: BadgeTone }> = {
  defect: { icon: CircleX, tone: 'bad' },
  downtime: { icon: Clock, tone: 'warn' },
  material: { icon: Package, tone: 'accent' },
  safety: { icon: ShieldAlert, tone: 'bad' },
  idea: { icon: Lightbulb, tone: 'teal' },
}

export function EventTypeBadge({ type }: { type: EventType }) {
  const t = useT()
  const { icon: Icon, tone } = STYLE[type]
  return (
    <Badge tone={tone}>
      <Icon aria-hidden />
      {t(`eventType.${type}`)}
    </Badge>
  )
}

export function EventStatusBadge({ status }: { status: 'draft' | 'confirmed' }) {
  const t = useT()
  return status === 'confirmed' ? (
    <Badge tone="good">{t('event.status.confirmed')}</Badge>
  ) : (
    <Badge tone="warn">{t('event.status.draft')}</Badge>
  )
}
