import { Link, type LinkProps } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

export function BackLink({ children, ...props }: LinkProps & { children: ReactNode }) {
  return (
    <Link
      {...props}
      className="-ml-1 inline-flex h-8 items-center gap-1 text-sm text-muted hover:text-ink"
    >
      <ChevronLeft className="size-4" aria-hidden />
      {children}
    </Link>
  )
}
