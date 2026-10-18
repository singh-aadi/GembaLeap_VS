import { queryOptions } from '@tanstack/react-query'
import { getAssessment, getMaturity } from './api'

export const maturityKeys = {
  all: ['maturity'] as const,
  site: () => [...maturityKeys.all, 'site'] as const,
  assessment: () => [...maturityKeys.all, 'assessment'] as const,
}

export const maturityQuery = () =>
  queryOptions({ queryKey: maturityKeys.site(), queryFn: () => getMaturity() })
export const assessmentQuery = () =>
  queryOptions({ queryKey: maturityKeys.assessment(), queryFn: () => getAssessment() })

export type MaturityView = Awaited<ReturnType<typeof getMaturity>>
export type MaturityStage = MaturityView['stages'][number]
export type MaturityCell = MaturityStage['cells'][number]
