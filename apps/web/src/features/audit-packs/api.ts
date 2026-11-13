import { AuditStandard } from '@sutraos/schemas'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { db } from '@/lib/store.server'
import { buildAuditPack } from './audit-packs.server'

export const getAuditPack = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ standard: AuditStandard }))
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['supplier_owner', 'supplier_quality'])
    const store = await db()
    return buildAuditPack(store, siteOf(store, user).id, data.standard)
  })
