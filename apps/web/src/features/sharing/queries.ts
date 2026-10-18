import { queryOptions } from '@tanstack/react-query'
import { getSharing } from './api'

export const sharingKeys = {
  all: ['sharing'] as const,
  overview: () => [...sharingKeys.all, 'overview'] as const,
}

export const sharingQuery = () =>
  queryOptions({ queryKey: sharingKeys.overview(), queryFn: () => getSharing() })

export type Sharing = Awaited<ReturnType<typeof getSharing>>
