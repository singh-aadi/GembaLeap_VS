import { createFileRoute } from '@tanstack/react-router'
import { AskPage } from '@/features/ask/components/ask-page'
import { askScopeQuery } from '@/features/ask/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/ask')({
  beforeLoad: guard('/s/ask'),
  loader: ({ context }) => context.queryClient.ensureQueryData(askScopeQuery()),
  component: () => <AskPage />,
})
