import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { MessageCircleQuestion } from 'lucide-react'
import { BackLink } from '@/components/app/back-link'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { reportDetailQuery } from '../queries'
import { ReportDocument } from './report-document'
import { ReportPeriod } from './report-period'
import { SealPanel } from './seal-panel'

const route = getRouteApi('/b/reports/$reportId')

export function BuyerReportPage() {
  const t = useT()
  const { reportId } = route.useParams()
  const { data } = useSuspenseQuery(reportDetailQuery(reportId))
  const { report } = data
  return (
    <>
      <PageHeader
        back={<BackLink to="/b/reports">{t('nav.reports')}</BackLink>}
        title={
          <ReportPeriod period={report.period} start={report.periodStart} end={report.periodEnd} />
        }
        meta={`${data.supplierName} · ${data.siteName}`}
        actions={
          <Button asChild>
            <Link to="/b/ask" search={{ supplier: report.tenantId }}>
              <MessageCircleQuestion aria-hidden />
              {t('report.ask')}
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ReportDocument data={data} />
        <div>
          <SealPanel data={data} />
        </div>
      </div>
    </>
  )
}
