import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AppError } from '@/lib/app-error'
import { useT } from '@/lib/i18n'

export function PendingView() {
  return (
    <div className="space-y-4" aria-busy>
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function ErrorView({ error, reset }: ErrorComponentProps) {
  const t = useT()
  const router = useRouter()
  const code = AppError.codeOf(error)
  return (
    <div role="alert" className="rounded-lg border border-bad/30 bg-bad-soft p-4">
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-bad" aria-hidden />
        <div>
          <p className="font-medium text-ink">{t(`error.${code}`)}</p>
          <p className="mt-1 text-sm text-muted">{t('error.recover')}</p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              reset()
              void router.invalidate()
            }}
          >
            {t('common.retry')}
          </Button>
        </div>
      </div>
    </div>
  )
}
