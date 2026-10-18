import type { HeatmapFilters } from '@gembaleap/schemas'
import { queryOptions } from '@tanstack/react-query'
import { getSourcing, getSupplierDetail, getSupplierHeatmap } from './api'

export const buyerKeys = {
  all: ['buyer'] as const,
  heatmap: (filters: Omit<HeatmapFilters, 'view'>) =>
    [...buyerKeys.all, 'heatmap', filters] as const,
  supplier: (tenantId: string) => [...buyerKeys.all, 'supplier', tenantId] as const,
  sourcing: (filters: { process?: string; minLadder?: number }) =>
    [...buyerKeys.all, 'sourcing', filters] as const,
}

export const heatmapQuery = ({ sector, drift, sort }: HeatmapFilters) =>
  queryOptions({
    queryKey: buyerKeys.heatmap({ sector, drift, sort }),
    queryFn: () => getSupplierHeatmap({ data: { sector, drift, sort, view: 'table' } }),
  })

export const supplierDetailQuery = (tenantId: string) =>
  queryOptions({
    queryKey: buyerKeys.supplier(tenantId),
    queryFn: () => getSupplierDetail({ data: { tenantId } }),
  })

export const sourcingQuery = (filters: { process?: string; minLadder?: number }) =>
  queryOptions({
    queryKey: buyerKeys.sourcing(filters),
    queryFn: () => getSourcing({ data: filters }),
  })

export type HeatmapRow = Awaited<ReturnType<typeof getSupplierHeatmap>>['rows'][number]
export type SupplierDetail = Awaited<ReturnType<typeof getSupplierDetail>>
export type SourcingRow = Awaited<ReturnType<typeof getSourcing>>['rows'][number]
