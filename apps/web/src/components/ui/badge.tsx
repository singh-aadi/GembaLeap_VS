import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5',
  {
    variants: {
      tone: {
        neutral: 'bg-subtle text-muted',
        accent: 'bg-accent-soft text-accent',
        teal: 'bg-teal-soft text-teal',
        good: 'bg-good-soft text-good',
        warn: 'bg-warn-soft text-warn-ink',
        bad: 'bg-bad-soft text-bad',
        outline: 'border border-line text-muted',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>

export function Badge({
  className,
  tone,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
