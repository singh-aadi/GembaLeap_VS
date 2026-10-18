import { queryOptions } from '@tanstack/react-query'
import { getNcr, listNcrs } from './api'

export const ncrKeys = {
  all: ['ncrs'] as const,
  list: () => [...ncrKeys.all, 'list'] as const,
  detail: (id: string) => [...ncrKeys.all, 'detail', id] as const,
}

export const ncrListQuery = () =>
  queryOptions({ queryKey: ncrKeys.list(), queryFn: () => listNcrs() })
export const ncrDetailQuery = (id: string) =>
  queryOptions({ queryKey: ncrKeys.detail(id), queryFn: () => getNcr({ data: { id } }) })

export type NcrView = Awaited<ReturnType<typeof getNcr>>
export type NcrSummary = Awaited<ReturnType<typeof listNcrs>>[number]
