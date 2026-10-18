import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-on-accent hover:bg-accent/90',
        secondary: 'border border-line bg-surface text-ink hover:bg-subtle',
        ghost: 'text-ink hover:bg-subtle',
        danger: 'border border-bad/40 bg-surface text-bad hover:bg-bad-soft',
        link: 'h-auto px-0 text-accent underline-offset-4 hover:underline',
      },
      size: {
        md: 'h-11 px-4 text-sm',
        sm: 'h-9 px-3 text-sm',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button'
  return (
    <Component
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
