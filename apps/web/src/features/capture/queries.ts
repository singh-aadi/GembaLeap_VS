import { queryOptions } from '@tanstack/react-query'
import { getCaptureContext } from './api'

export const captureKeys = {
  all: ['capture'] as const,
  context: () => [...captureKeys.all, 'context'] as const,
}

export const captureContextQuery = () =>
  queryOptions({
    queryKey: captureKeys.context(),
    queryFn: () => getCaptureContext(),
    staleTime: 5 * 60_000,
  })
