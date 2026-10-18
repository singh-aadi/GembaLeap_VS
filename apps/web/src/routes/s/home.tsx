import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/features/home/components/home-page'
import { supplierHomeQuery } from '@/features/home/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/home')({
  beforeLoad: guard('/s/home'),
  loader: ({ context }) => context.queryClient.ensureQueryData(supplierHomeQuery()),
  component: HomePage,
})
