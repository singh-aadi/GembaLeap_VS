import { createFileRoute } from '@tanstack/react-router'
import { SupplierReportsPage } from '@/features/reports/components/reports-page'
import { reportListQuery } from '@/features/reports/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/reports/')({
  beforeLoad: guard('/s/reports'),
  loader: ({ context }) => context.queryClient.ensureQueryData(reportListQuery()),
  component: SupplierReportsPage,
})
