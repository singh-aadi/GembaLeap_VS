import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { FileCheck } from 'lucide-react'
import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { Select } from '@/components/ui/field'
import { useT } from '@/lib/i18n'
import { reportListQuery } from '../queries'
import { ReportsList } from './reports-list'

const buyerRoute = getRouteApi('/b/reports/')

export function SupplierReportsPage() {
  const t = useT()
  const { data } = useSuspenseQuery(reportListQuery())
  return (
    <>
      <PageHeader title={t('nav.reports')} meta={t('report.list.supplierHint')} />
      {data.reports.length === 0 ? (
        <EmptyState icon={FileCheck} title={t('report.none')} />
      ) : (
        <ReportsList reports={data.reports} side="supplier" />
      )}
    </>
  )
}

export function BuyerReportsPage() {
  const t = useT()
  const { supplier } = buyerRoute.useSearch()
  const navigate = buyerRoute.useNavigate()
  const { data } = useSuspenseQuery(reportListQuery(supplier))
  return (
    <>
      <PageHeader title={t('nav.reports')} meta={t('report.list.buyerHint')} />
      <Select
        aria-label={t('report.col.supplier')}
        value={supplier ?? ''}
        onChange={(e) =>
          void navigate({ search: { supplier: e.target.value || undefined }, replace: true })
        }
        className="mb-4 sm:w-72"
      >
        <option value="">{t('report.allSuppliers')}</option>
        {data.suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      {data.reports.length === 0 ? (
        <EmptyState icon={FileCheck} title={t('report.none')} />
      ) : (
        <ReportsList reports={data.reports} side="buyer" />
      )}
    </>
  )
}
