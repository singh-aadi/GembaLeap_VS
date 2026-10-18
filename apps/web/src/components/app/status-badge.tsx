import { CircleAlert, CircleCheck, CircleX, Clock, type LucideIcon } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/badge'

export type Status = 'pass' | 'warn' | 'fail' | 'pending'

const STYLE: Record<Status, { tone: BadgeTone; icon: LucideIcon }> = {
  pass: { tone: 'good', icon: CircleCheck },
  warn: { tone: 'warn', icon: CircleAlert },
  fail: { tone: 'bad', icon: CircleX },
  pending: { tone: 'neutral', icon: Clock },
}

/** Colour is never the only signal: every status carries an icon and a word. */
export function StatusBadge({ status, label }: { status: Status; label: string }) {
  const { tone, icon: Icon } = STYLE[status]
  return (
    <Badge tone={tone}>
      <Icon aria-hidden />
      {label}
    </Badge>
  )
}
