import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  )
}

export function Th({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-10 border-b border-line px-3 text-left text-xs font-medium whitespace-nowrap text-muted first:pl-4 last:pr-4',
        className,
      )}
      {...props}
    />
  )
}

export function Td({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      className={cn('border-b border-line px-3 py-3 align-top first:pl-4 last:pr-4', className)}
      {...props}
    />
  )
}
