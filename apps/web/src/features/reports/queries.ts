import { queryOptions } from '@tanstack/react-query'
import { getReport, listReports } from './api'

export const reportKeys = {
  all: ['reports'] as const,
  list: (supplier?: string) => [...reportKeys.all, 'list', supplier ?? 'all'] as const,
  detail: (id: string) => [...reportKeys.all, 'detail', id] as const,
}

export const reportListQuery = (supplier?: string) =>
  queryOptions({
    queryKey: reportKeys.list(supplier),
    queryFn: () => listReports({ data: { supplier } }),
  })

export const reportDetailQuery = (id: string) =>
  queryOptions({ queryKey: reportKeys.detail(id), queryFn: () => getReport({ data: { id } }) })

export type ReportDetail = Awaited<ReturnType<typeof getReport>>
export type ReportSummary = Awaited<ReturnType<typeof listReports>>['reports'][number]
