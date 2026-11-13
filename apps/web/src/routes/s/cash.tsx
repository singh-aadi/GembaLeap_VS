import { createFileRoute } from '@tanstack/react-router'
import { CashPage } from '@/features/cash/components/cash-page'
import { cashQuery } from '@/features/cash/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/cash')({
  beforeLoad: guard('/s/cash'),
  loader: ({ context }) => context.queryClient.ensureQueryData(cashQuery()),
  component: CashPage,
})
