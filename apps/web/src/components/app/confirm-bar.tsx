import type { ReactNode } from 'react'

/** The page's single primary action: sticky above the bottom tabs on phones, inline on desktop. */
export function ConfirmBar({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-surface p-3 lg:static lg:mt-6 lg:rounded-lg lg:border lg:p-4">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {note ? <p className="text-xs text-muted sm:text-sm">{note}</p> : <span />}
        <div className="flex gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">{children}</div>
      </div>
    </div>
  )
}
