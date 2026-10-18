import { createFileRoute } from '@tanstack/react-router'
import { NcrRoom } from '@/features/ncr/components/ncr-room'
import { ncrDetailQuery } from '@/features/ncr/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/b/ncr/$ncrId')({
  beforeLoad: guard('/b/ncr'),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(ncrDetailQuery(params.ncrId)),
  component: NcrPage,
})

function NcrPage() {
  const { ncrId } = Route.useParams()
  return <NcrRoom ncrId={ncrId} />
}
