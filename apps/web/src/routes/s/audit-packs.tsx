import { AuditStandard } from '@sutraos/schemas'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AuditPackPage } from '@/features/audit-packs/components/audit-pack-page'
import { auditPackQuery } from '@/features/audit-packs/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/audit-packs')({
  validateSearch: z.object({ standard: AuditStandard.catch('zed') }),
  loaderDeps: ({ search }) => search,
  beforeLoad: guard('/s/audit-packs'),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(auditPackQuery(deps.standard)),
  component: AuditPackPage,
})
