import { queryOptions } from '@tanstack/react-query'
import { getAskScope } from './api'

export const askKeys = {
  all: ['ask'] as const,
  scope: () => [...askKeys.all, 'scope'] as const,
}

export const askScopeQuery = () =>
  queryOptions({ queryKey: askKeys.scope(), queryFn: () => getAskScope(), staleTime: 5 * 60_000 })
