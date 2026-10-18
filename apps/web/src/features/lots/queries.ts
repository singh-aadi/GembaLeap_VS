import { queryOptions } from '@tanstack/react-query'
import { getLot, listLots } from './api'

export const lotKeys = {
  all: ['lots'] as const,
  list: () => [...lotKeys.all, 'list'] as const,
  detail: (id: string) => [...lotKeys.all, 'detail', id] as const,
}

export const lotListQuery = () =>
  queryOptions({ queryKey: lotKeys.list(), queryFn: () => listLots() })
export const lotDetailQuery = (id: string) =>
  queryOptions({ queryKey: lotKeys.detail(id), queryFn: () => getLot({ data: { id } }) })

export type LotDetail = Awaited<ReturnType<typeof getLot>>
export type LotRow = Awaited<ReturnType<typeof listLots>>[number]
