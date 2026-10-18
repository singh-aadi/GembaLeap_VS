import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { BackLink } from '@/components/app/back-link'
import { ConfirmBar } from '@/components/app/confirm-bar'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'
import { publishReport } from '../api'
import { reportDetailQuery, reportKeys } from '../queries'
import { ReportDocument } from './report-document'
import { ReportPeriod, ReportStatus } from './report-period'
import { SealPanel } from './seal-panel'

const route = getRouteApi('/s/reports/$reportId')

export function SupplierReportPage() {
  const t = useT()
  const { reportId } = route.useParams()
  const queryClient = useQueryClient()
  const publish = useServerFn(publishReport)
  const { data } = useSuspenseQuery(reportDetailQuery(reportId))
  const { report } = data

  const mutation = useMutation({
    mutationFn: () => publish({ data: { id: reportId } }),
    onSuccess: () => {
      toast.success(t('report.published'))
      void queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
    onError: (error) => toastError(t, error),
  })

  return (
    <>
      <PageHeader
        back={<BackLink to="/s/reports">{t('nav.reports')}</BackLink>}
        title={
          <ReportPeriod period={report.period} start={report.periodStart} end={report.periodEnd} />
        }
        meta={
          <span className="inline-flex flex-wrap items-center gap-2">
            {data.siteName}
            <ReportStatus status={report.status} />
          </span>
        }
      />
      {report.sealHash ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ReportDocument data={data} />
          <div>
            <SealPanel data={data} />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl">
          <ReportDocument data={data} />
        </div>
      )}
      {report.status === 'draft' ? (
        <ConfirmBar note={t('report.publishNote', { buyers: data.buyers.join(', ') || '—' })}>
          <Button variant="primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            <Send aria-hidden />
            {t('report.publish')}
          </Button>
        </ConfirmBar>
      ) : null}
    </>
  )
}
