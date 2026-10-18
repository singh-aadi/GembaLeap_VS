import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ChecklistPage } from '@/features/checklist/components/checklist-page'
import { checklistQuery } from '@/features/checklist/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/checklist')({
  validateSearch: z.object({ stage: z.string().optional() }),
  beforeLoad: guard('/s/checklist'),
  loader: ({ context }) => context.queryClient.ensureQueryData(checklistQuery()),
  component: ChecklistPage,
})
