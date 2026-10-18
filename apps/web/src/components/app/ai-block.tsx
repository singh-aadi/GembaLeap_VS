import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

/**
 * Wraps any AI-generated content: teal left marker plus a state badge.
 * Stays "Draft — needs approval" until a named person approves it.
 */
export function AiBlock({
  approved,
  approvedLabel,
  source,
  children,
  className,
}: {
  approved: boolean
  approvedLabel?: string
  source?: string
  children: ReactNode
  className?: string
}) {
  const t = useT()
  return (
    <div className={cn('border-l-4 border-teal bg-surface pl-4', className)}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone="teal">
          <Sparkles aria-hidden />
          {t('ai.generated')}
        </Badge>
        {approved ? (
          <Badge tone="good">{approvedLabel ?? t('ai.approved')}</Badge>
        ) : (
          <Badge tone="warn">{t('ai.draft')}</Badge>
        )}
        {source ? <span className="text-xs text-muted">{source}</span> : null}
      </div>
      {children}
    </div>
  )
}
