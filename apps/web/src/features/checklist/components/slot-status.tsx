import type { SlotStatus } from '@gembaleap/schemas'
import { CircleAlert, CircleCheck, CircleDot, Circle, Clock, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

const STYLE: Record<SlotStatus, { icon: LucideIcon; className: string }> = {
  done: { icon: CircleCheck, className: 'text-good' },
  out_of_limit: { icon: CircleAlert, className: 'text-bad' },
  due: { icon: CircleDot, className: 'text-accent' },
  overdue: { icon: Clock, className: 'text-warn-ink' },
  upcoming: { icon: Circle, className: 'text-muted' },
}

export function SlotStatusIcon({ status }: { status: SlotStatus }) {
  const { icon: Icon, className } = STYLE[status]
  return <Icon className={cn('size-5 shrink-0', className)} aria-hidden />
}

export function SlotStatusLabel({ status }: { status: SlotStatus }) {
  const t = useT()
  return (
    <span className={cn('text-xs font-medium', STYLE[status].className)}>
      {t(`slot.${status}`)}
    </span>
  )
}
