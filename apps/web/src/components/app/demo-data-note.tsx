import { useT } from '@/lib/i18n'
import { cn } from '@/lib/cn'

export function DemoDataNote({ className }: { className?: string }) {
  const t = useT()
  return <p className={cn('text-xs text-on-navy-muted', className)}>{t('shell.syntheticData')}</p>
}
