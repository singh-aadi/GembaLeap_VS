import { queryOptions } from '@tanstack/react-query'
import { getLevel } from './api'

export const levelKeys = { all: ['level'] as const }

export const levelQuery = () => queryOptions({ queryKey: levelKeys.all, queryFn: () => getLevel() })

export type LevelView = Awaited<ReturnType<typeof getLevel>>
