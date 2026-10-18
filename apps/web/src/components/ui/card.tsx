import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section className={cn('rounded-lg border border-line bg-surface', className)} {...props} />
  )
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'flex items-start justify-between gap-3 border-b border-line px-4 py-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm">{title}</h2>
        {description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-4', className)} {...props} />
}
