import type { InspectionTier } from '@gembaleap/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { decideInspectionTier } from '../api'
import { buyerKeys, type SupplierDetail } from '../queries'

/** Earned inspection: the record suggests a tier, a person at the buyer decides. */
export function TierCard({ data }: { data: SupplierDetail }) {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const decide = useServerFn(decideInspectionTier)
  const { card } = data
  const mutation = useMutation({
    mutationFn: (tier: InspectionTier) =>
      decide({ data: { supplierTenantId: data.tenant.id, tier } }),
    onSuccess: () => {
      toast.success(t('tier.recorded'))
      void queryClient.invalidateQueries({ queryKey: buyerKeys.all })
    },
    onError: (error) => toastError(t, error),
  })
  return (
    <Card>
      <CardHeader title={t('tier.title')} description={t('tier.hint')} />
      <CardBody className="space-y-3">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          {t('tier.current')} <Badge>{t(`tier.${card.inspectionTier}`)}</Badge>
        </p>
        {card.suggestedTier ? (
          <>
            <p className="flex flex-wrap items-center gap-2 text-sm">
              {t('tier.suggested')} <Badge tone="teal">{t(`tier.${card.suggestedTier}`)}</Badge>
            </p>
            <p className="text-xs text-muted">
              {t('tier.basis', {
                streak: card.ftrStreak,
                adherence: f.percent(card.checklistAdherence30d),
                otif: f.percent(card.otif),
              })}
            </p>
            {data.canDecide ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => mutation.mutate(card.inspectionTier)}
                  disabled={mutation.isPending}
                >
                  {t('tier.keep')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => card.suggestedTier && mutation.mutate(card.suggestedTier)}
                  disabled={mutation.isPending}
                >
                  {t('tier.apply', { tier: t(`tier.${card.suggestedTier}`) })}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted">{t('tier.readOnly')}</p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted">{t('tier.noSuggestion')}</p>
        )}
      </CardBody>
    </Card>
  )
}
