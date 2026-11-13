import type { AuditStandard } from '@sutraos/schemas'
import { queryOptions } from '@tanstack/react-query'
import { getAuditPack } from './api'

export const auditPackKeys = {
  all: ['audit-packs'] as const,
  standard: (standard: AuditStandard) => [...auditPackKeys.all, standard] as const,
}

export const auditPackQuery = (standard: AuditStandard) =>
  queryOptions({
    queryKey: auditPackKeys.standard(standard),
    queryFn: () => getAuditPack({ data: { standard } }),
  })
