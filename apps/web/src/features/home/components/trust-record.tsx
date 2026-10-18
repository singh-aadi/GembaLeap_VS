import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/lib/i18n'
import type { SupplierHome } from '../queries'

/**
 * What the evidence earns the supplier with each buyer: first-time-right
 * streak, inspection tier, report cadence and the buyer's own payment clock.
 */
export function TrustRecord({ buyers }: { buyers: SupplierHome['buyers'] }) {
  const t = useT()
  return (
    <Card>
      <CardHeader title={t('home.trust')} description={t('home.trust.hint')} />
      {buyers.map((buyer) => (
        <CardBody key={buyer.buyerName} className="space-y-3 border-b border-line last:border-b-0">
          <p className="text-sm font-medium">{buyer.buyerName}</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">{t('home.trust.ftr')}</dt>
              <dd className="font-semibold text-heading tabular-nums">
                {t('home.trust.lots', { count: buyer.ftrStreak })}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t('home.trust.reports')}</dt>
              <dd className="font-semibold text-heading tabular-nums">
                {buyer.reportsPublished7d} / 7
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted">{t('home.trust.inspection')}</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <Badge>{t(`tier.${buyer.inspectionTier}`)}</Badge>
                {buyer.suggestedTier && buyer.suggestedTier !== buyer.inspectionTier ? (
                  <span className="text-xs text-muted">
                    {t('home.trust.eligible', { tier: t(`tier.${buyer.suggestedTier}`) })}
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
          {buyer.invoices.length > 0 ? (
            <div>
              <p className="text-xs text-muted">{t('home.trust.payments')}</p>
              <ul className="mt-1 space-y-1">
                {buyer.invoices.map((invoice) => (
                  <li
                    key={invoice.number}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="font-mono">{invoice.number}</span>
                    <span
                      className={
                        invoice.day > invoice.term - 7
                          ? 'font-medium text-warn-ink tabular-nums'
                          : 'text-muted tabular-nums'
                      }
                    >
                      {t('home.trust.paymentDay', { day: invoice.day, term: invoice.term })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardBody>
      ))}
    </Card>
  )
}
