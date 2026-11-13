import { queryOptions } from '@tanstack/react-query'
import { getSkills } from './api'

export const skillKeys = { all: ['skills'] as const }

export const skillsQuery = () =>
  queryOptions({ queryKey: skillKeys.all, queryFn: () => getSkills() })

export type SkillRow = Awaited<ReturnType<typeof getSkills>>[number]
