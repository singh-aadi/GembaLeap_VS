import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AskPage } from '@/features/ask/components/ask-page'
import { askScopeQuery } from '@/features/ask/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/b/ask')({
  validateSearch: z.object({ supplier: z.string().optional() }),
  beforeLoad: guard('/b/ask'),
  loader: ({ context }) => context.queryClient.ensureQueryData(askScopeQuery()),
  component: BuyerAsk,
})

function BuyerAsk() {
  const { supplier } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <AskPage
      supplier={supplier}
      onSupplierChange={(id) => void navigate({ search: { supplier: id }, replace: true })}
    />
  )
}
