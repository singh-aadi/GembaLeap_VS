import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Check, X } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toastError } from '@/lib/errors'
import { useT, type MessageId } from '@/lib/i18n'
import { setOpenProfile } from '../api'
import { sharingKeys } from '../queries'

const SHOWN: MessageId[] = [
  'profile.shows.ladder',
  'profile.shows.days',
  'profile.shows.adherence',
  'profile.shows.ftr',
  'profile.shows.certs',
]
const HIDDEN: MessageId[] = [
  'profile.hides.photos',
  'profile.hides.reports',
  'profile.hides.customers',
]

/** Opt-in listing that lets new buyers find the supplier on evidence, not on history. */
export function OpenProfileCard({ enabled }: { enabled: boolean }) {
  const t = useT()
  const queryClient = useQueryClient()
  const update = useServerFn(setOpenProfile)
  const mutation = useMutation({
    mutationFn: (value: boolean) => update({ data: { enabled: value } }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: sharingKeys.all }),
    onError: (error) => toastError(t, error),
  })
  const value = mutation.isPending ? Boolean(mutation.variables) : enabled
  return (
    <Card>
      <CardHeader
        title={t('profile.title')}
        description={t('profile.hint')}
        action={
          <Switch
            checked={value}
            onCheckedChange={(v) => mutation.mutate(v)}
            aria-label={t('profile.title')}
          />
        }
      />
      <CardBody className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted">{t('profile.shows')}</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {SHOWN.map((id) => (
              <li key={id} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-good" aria-hidden />
                {t(id)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-muted">{t('profile.hides')}</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {HIDDEN.map((id) => (
              <li key={id} className="flex gap-2">
                <X className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                {t(id)}
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  )
}
