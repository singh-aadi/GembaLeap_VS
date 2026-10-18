import { createFileRoute } from '@tanstack/react-router'
import { BuyerReportPage } from '@/features/reports/components/buyer-report-page'
import { reportDetailQuery } from '@/features/reports/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/b/reports/$reportId')({
  beforeLoad: guard('/b/reports'),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(reportDetailQuery(params.reportId)),
  component: BuyerReportPage,
})
