import { Tabs as TabsPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const Tabs = TabsPrimitive.Root
export const TabsContent = TabsPrimitive.Content

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        '-mb-px inline-flex h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-muted',
        'hover:text-ink data-[state=active]:border-accent data-[state=active]:text-accent',
        className,
      )}
      {...props}
    />
  )
}
