import { createFileRoute } from '@tanstack/react-router'
import { LotPage } from '@/features/lots/components/lot-page'
import { lotDetailQuery } from '@/features/lots/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/lots/$lotId')({
  beforeLoad: guard('/s/lots'),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(lotDetailQuery(params.lotId)),
  component: SupplierLot,
})

function SupplierLot() {
  const { lotId } = Route.useParams()
  return <LotPage lotId={lotId} side="supplier" />
}
