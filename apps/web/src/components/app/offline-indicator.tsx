import { CloudUpload, WifiOff } from 'lucide-react'
import { useOnline } from '@/hooks/use-online'
import { useOutboxCount } from '@/hooks/use-outbox-count'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

/** Visible only when offline or when captures are waiting to send. */
export function OfflineIndicator({ tone }: { tone: 'navy' | 'light' }) {
  const t = useT()
  const online = useOnline()
  const pending = useOutboxCount()
  if (online && pending === 0) return null
  const Icon = online ? CloudUpload : WifiOff
  return (
    <span
      role="status"
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium',
        tone === 'navy' ? 'bg-white/12 text-on-navy' : 'bg-warn-soft text-warn-ink',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {online ? t('offline.sending', { count: pending }) : t('offline.offline', { count: pending })}
    </span>
  )
}
