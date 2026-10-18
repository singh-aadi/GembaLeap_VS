import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { SupplierDetail } from '../queries'

/** Trust runs both ways: the buyer sees its own payment record to this supplier. */
export function PaymentCard({ data }: { data: SupplierDetail }) {
  const t = useT()
  const f = useFormat()
  return (
    <Card>
      <CardHeader
        title={t('payments.title')}
        description={t('payments.hint', { rate: f.percent(data.card.paymentOnTime) })}
      />
      <ul className="divide-y divide-line">
        {data.invoices.map((invoice) => {
          const late = invoice.day > invoice.termDays
          const near = !invoice.paidAt && invoice.day > invoice.termDays - 7
          return (
            <li
              key={invoice.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs">{invoice.number}</p>
                <p className="text-xs text-muted tabular-nums">
                  {f.money(invoice.amount, invoice.currency)}
                </p>
              </div>
              {invoice.paidAt ? (
                <Badge tone={late ? 'warn' : 'good'}>
                  {t('payments.paidDay', { day: invoice.day })}
                </Badge>
              ) : (
                <Badge tone={near ? 'warn' : 'neutral'}>
                  {t('payments.openDay', { day: invoice.day, term: invoice.termDays })}
                </Badge>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
