import { createFileRoute } from '@tanstack/react-router'
import { LotPage } from '@/features/lots/components/lot-page'
import { lotDetailQuery } from '@/features/lots/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/b/passports/$lotId')({
  beforeLoad: guard('/b/passports'),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(lotDetailQuery(params.lotId)),
  component: BuyerPassport,
})

function BuyerPassport() {
  const { lotId } = Route.useParams()
  return <LotPage lotId={lotId} side="buyer" />
}
