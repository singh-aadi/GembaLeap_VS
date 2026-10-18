import { createFileRoute } from '@tanstack/react-router'
import { NcrList } from '@/features/ncr/components/ncr-list'
import { ncrListQuery } from '@/features/ncr/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/b/ncr/')({
  beforeLoad: guard('/b/ncr'),
  loader: ({ context }) => context.queryClient.ensureQueryData(ncrListQuery()),
  component: () => <NcrList side="buyer" />,
})
