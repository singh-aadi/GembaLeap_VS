import { SkillKey } from '@sutraos/schemas'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { authMiddleware } from '@/lib/auth'
import { requireRole, siteOf } from '@/lib/auth.server'
import { db } from '@/lib/store.server'
import { setSkill, skillsView } from './skills.server'

export const getSkills = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, ['supplier_owner'])
    const store = await db()
    return skillsView(store, siteOf(store, user).id)
  })

export const toggleSkill = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ skill: SkillKey, enabled: z.boolean() }))
  .handler(async ({ data, context: { user } }) => {
    requireRole(user, ['supplier_owner'])
    const store = await db()
    const site = siteOf(store, user)
    await setSkill(store, user, site.id, site.tenantId, data.skill, data.enabled)
    return { ok: true }
  })
