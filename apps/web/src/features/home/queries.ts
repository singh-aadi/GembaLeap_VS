import { queryOptions } from '@tanstack/react-query'
import { getSupplierHome } from './api'

export const homeKeys = {
  all: ['home'] as const,
  supplier: () => [...homeKeys.all, 'supplier'] as const,
}

export const supplierHomeQuery = () =>
  queryOptions({ queryKey: homeKeys.supplier(), queryFn: () => getSupplierHome() })

export type SupplierHome = Awaited<ReturnType<typeof getSupplierHome>>
