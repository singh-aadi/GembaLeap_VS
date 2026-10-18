import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  closeLabel: string
  children: ReactNode
  footer?: ReactNode
}

/** Bottom sheet on phones, right-hand panel from 640 px. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
  footer,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-navy/40" />
        <Dialog.Content
          className={cn(
            'fixed z-50 flex flex-col bg-surface shadow-lg outline-none',
            'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-lg',
            'sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[440px] sm:rounded-none sm:border-l sm:border-line',
          )}
        >
          <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-heading">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-xs text-muted">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="-mr-2 inline-flex size-11 items-center justify-center rounded-lg text-muted hover:bg-subtle">
              <X className="size-5" aria-hidden />
              <span className="sr-only">{closeLabel}</span>
            </Dialog.Close>
          </header>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
          {footer ? <footer className="border-t border-line p-4">{footer}</footer> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
