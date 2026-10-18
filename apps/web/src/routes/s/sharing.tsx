import { createFileRoute } from '@tanstack/react-router'
import { SharingPage } from '@/features/sharing/components/sharing-page'
import { sharingQuery } from '@/features/sharing/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/sharing')({
  beforeLoad: guard('/s/sharing'),
  loader: ({ context }) => context.queryClient.ensureQueryData(sharingQuery()),
  component: SharingPage,
})
