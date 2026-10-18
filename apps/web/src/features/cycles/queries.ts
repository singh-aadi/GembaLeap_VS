import { queryOptions } from '@tanstack/react-query'
import { getCycle } from './api'

export const cycleKeys = {
  all: ['cycles'] as const,
  detail: (id: string) => [...cycleKeys.all, 'detail', id] as const,
}

export const cycleDetailQuery = (id: string) =>
  queryOptions({ queryKey: cycleKeys.detail(id), queryFn: () => getCycle({ data: { id } }) })

export type CycleDetail = Awaited<ReturnType<typeof getCycle>>
