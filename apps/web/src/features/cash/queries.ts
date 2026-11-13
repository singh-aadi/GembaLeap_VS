import { queryOptions } from '@tanstack/react-query'
import { getCash } from './api'

export const cashKeys = { all: ['cash'] as const }

export const cashQuery = () => queryOptions({ queryKey: cashKeys.all, queryFn: () => getCash() })

export type Cash = Awaited<ReturnType<typeof getCash>>
