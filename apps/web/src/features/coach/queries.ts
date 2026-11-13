import { queryOptions } from '@tanstack/react-query'
import { getPlant, listPlants } from './api'

export const coachKeys = {
  all: ['coach'] as const,
  plants: () => [...coachKeys.all, 'plants'] as const,
  plant: (siteId: string) => [...coachKeys.all, 'plant', siteId] as const,
}

export const plantsQuery = () =>
  queryOptions({ queryKey: coachKeys.plants(), queryFn: () => listPlants() })
export const plantQuery = (siteId: string) =>
  queryOptions({ queryKey: coachKeys.plant(siteId), queryFn: () => getPlant({ data: { siteId } }) })

export type CoachPlant = Awaited<ReturnType<typeof getPlant>>
