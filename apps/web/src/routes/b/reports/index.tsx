import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BuyerReportsPage } from '@/features/reports/components/reports-page'
import { reportListQuery } from '@/features/reports/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/b/reports/')({
  validateSearch: z.object({ supplier: z.string().optional() }),
  loaderDeps: ({ search }) => search,
  beforeLoad: guard('/b/reports'),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(reportListQuery(deps.supplier)),
  component: BuyerReportsPage,
})
