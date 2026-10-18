import { createFileRoute } from '@tanstack/react-router'
import { CapturePage } from '@/features/capture/components/capture-page'
import { captureContextQuery } from '@/features/capture/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/capture')({
  beforeLoad: guard('/s/capture'),
  loader: ({ context }) => context.queryClient.ensureQueryData(captureContextQuery()),
  component: CapturePage,
})
