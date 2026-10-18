import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const control =
  'w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus-visible:border-accent disabled:opacity-60'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(control, 'h-11', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(control, 'min-h-24 py-2', className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(control, 'h-11 pr-8', className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('mb-1 block text-xs font-medium text-muted', className)} {...props} />
}
