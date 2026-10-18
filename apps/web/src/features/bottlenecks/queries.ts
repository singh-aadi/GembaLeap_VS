import { queryOptions } from '@tanstack/react-query'
import { listBottlenecks } from './api'

export const bottleneckKeys = {
  all: ['bottlenecks'] as const,
  list: () => [...bottleneckKeys.all, 'list'] as const,
}

export const bottleneckListQuery = () =>
  queryOptions({ queryKey: bottleneckKeys.list(), queryFn: () => listBottlenecks() })

export type BottleneckRow = Awaited<ReturnType<typeof listBottlenecks>>['rows'][number]
