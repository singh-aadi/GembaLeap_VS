import { queryOptions } from '@tanstack/react-query'
import { getChecklist } from './api'

export const checklistKeys = {
  all: ['checklist'] as const,
  today: () => [...checklistKeys.all, 'today'] as const,
}

export const checklistQuery = () =>
  queryOptions({ queryKey: checklistKeys.today(), queryFn: () => getChecklist() })

export type Checklist = Awaited<ReturnType<typeof getChecklist>>
export type ChecklistStage = Checklist['stages'][number]
export type ChecklistEntry = ChecklistStage['items'][number]
export type ChecklistSlot = ChecklistEntry['slots'][number]
