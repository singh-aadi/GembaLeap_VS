import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Sheet } from '@/components/ui/sheet'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { revokeConsent } from '../api'
import { sharingKeys, sharingQuery, type Sharing } from '../queries'

type Consent = Sharing['consents'][number]

export function ConsentList({ consents, clock }: { consents: Consent[]; clock: string }) {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const revoke = useServerFn(revokeConsent)
  const [confirming, setConfirming] = useState<Consent | null>(null)

  const mutation = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: sharingKeys.all })
      const previous = queryClient.getQueryData(sharingQuery().queryKey)
      if (previous) {
        queryClient.setQueryData(sharingQuery().queryKey, {
          ...previous,
          consents: previous.consents.map((c) =>
            c.id === id ? { ...c, active: false, revokedAt: clock } : c,
          ),
        })
      }
      setConfirming(null)
      return { previous }
    },
    onError: (error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(sharingQuery().queryKey, context.previous)
      toastError(t, error)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: sharingKeys.all }),
  })

  const soon = (expiresAt: string) => Date.parse(expiresAt) - Date.parse(clock) < 14 * 86_400_000

  return (
    <Card>
      <CardHeader title={t('sharing.consents')} description={t('sharing.consentsHint')} />
      <ul className="divide-y divide-line">
        {consents.map((consent) => (
          <li key={consent.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {consent.buyerName}
                {consent.active ? (
                  <Badge tone="good">{t('sharing.active')}</Badge>
                ) : (
                  <Badge>{t(consent.revokedAt ? 'sharing.revoked' : 'sharing.expired')}</Badge>
                )}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {consent.scope.map((s) => (
                  <Badge key={s} tone="outline">
                    {t(`scope.${s}`)}
                  </Badge>
                ))}
              </div>
              <p
                className={
                  consent.active && soon(consent.expiresAt)
                    ? 'mt-1 text-xs font-medium text-warn-ink'
                    : 'mt-1 text-xs text-muted'
                }
              >
                {consent.revokedAt
                  ? t('sharing.revokedOn', { date: f.date(consent.revokedAt) })
                  : t('sharing.expires', { date: f.date(consent.expiresAt) })}
              </p>
            </div>
            {consent.active ? (
              <Button variant="danger" onClick={() => setConfirming(consent)}>
                {t('sharing.revoke')}
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <Sheet
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={t('sharing.revokeTitle', { buyer: confirming?.buyerName ?? '' })}
        description={t('sharing.revokeBody')}
        closeLabel={t('common.close')}
        footer={
          <Button
            variant="danger"
            className="w-full"
            onClick={() => confirming && mutation.mutate(confirming.id)}
          >
            {t('sharing.revokeConfirm')}
          </Button>
        }
      >
        <p className="text-sm text-muted">{t('sharing.revokeDetail')}</p>
      </Sheet>
    </Card>
  )
}
