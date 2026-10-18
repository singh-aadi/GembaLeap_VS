import { createFileRoute } from '@tanstack/react-router'
import { ShiftBriefPage } from '@/features/shift-brief/components/shift-brief-page'
import { shiftBriefQuery } from '@/features/shift-brief/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/shift-brief')({
  beforeLoad: guard('/s/shift-brief'),
  loader: ({ context }) => context.queryClient.ensureQueryData(shiftBriefQuery()),
  component: ShiftBriefPage,
})
