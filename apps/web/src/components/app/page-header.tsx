import type { ReactNode } from 'react'

export function PageHeader({
  title,
  meta,
  actions,
  back,
}: {
  title: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  back?: ReactNode
}) {
  return (
    <div className="mb-4 lg:mb-6">
      {back ? <div className="mb-2">{back}</div> : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl">{title}</h1>
          {meta ? <div className="mt-1 text-sm text-muted">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
