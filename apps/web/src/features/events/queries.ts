import type { EventFilters } from '@gembaleap/schemas'
import { queryOptions } from '@tanstack/react-query'
import { getEvent, listEvents } from './api'

export const eventKeys = {
  all: ['events'] as const,
  list: (filters: EventFilters) => [...eventKeys.all, 'list', filters] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
}

export const eventListQuery = (filters: EventFilters) =>
  queryOptions({ queryKey: eventKeys.list(filters), queryFn: () => listEvents({ data: filters }) })

export const eventDetailQuery = (id: string) =>
  queryOptions({ queryKey: eventKeys.detail(id), queryFn: () => getEvent({ data: { id } }) })
