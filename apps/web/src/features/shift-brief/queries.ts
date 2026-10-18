import { queryOptions } from '@tanstack/react-query'
import { getShiftBrief } from './api'

export const shiftBriefKeys = {
  all: ['shift-brief'] as const,
  latest: () => [...shiftBriefKeys.all, 'latest'] as const,
}

export const shiftBriefQuery = () =>
  queryOptions({ queryKey: shiftBriefKeys.latest(), queryFn: () => getShiftBrief() })
