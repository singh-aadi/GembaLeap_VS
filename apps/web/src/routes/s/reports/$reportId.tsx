import { createFileRoute } from '@tanstack/react-router'
import { SupplierReportPage } from '@/features/reports/components/supplier-report-page'
import { reportDetailQuery } from '@/features/reports/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/reports/$reportId')({
  beforeLoad: guard('/s/reports'),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(reportDetailQuery(params.reportId)),
  component: SupplierReportPage,
})
