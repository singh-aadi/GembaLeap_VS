import { createFileRoute } from '@tanstack/react-router'
import { AuditPage } from '@/features/maturity/components/audit-page'
import { assessmentQuery } from '@/features/maturity/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/audit')({
  beforeLoad: guard('/s/audit'),
  loader: ({ context }) => context.queryClient.ensureQueryData(assessmentQuery()),
  component: AuditPage,
})
