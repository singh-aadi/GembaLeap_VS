import { createServerFn } from '@tanstack/react-start'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { db } from '@/lib/store.server'
import { levelView } from './level.server'

export const getLevel = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, ['supplier_owner', 'supplier_quality'])
    const store = await db()
    const view = levelView(store, siteOf(store, user).id)
    if (!view) throw new AppError('NOT_FOUND', 'site')
    return view
  })
