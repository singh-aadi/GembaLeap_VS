import { createFileRoute } from '@tanstack/react-router'
import { SupplierPage } from '@/features/buyer/components/supplier-page'
import { supplierDetailQuery } from '@/features/buyer/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/b/suppliers/$tenantId')({
  beforeLoad: guard('/b/suppliers'),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(supplierDetailQuery(params.tenantId)),
  component: SupplierPage,
})
