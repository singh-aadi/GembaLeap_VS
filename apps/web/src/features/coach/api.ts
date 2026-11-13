import { COACH_ROLES, Id, SkillKey, type User } from '@sutraos/schemas'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { levelView } from '@/features/level/level.server'
import { setSkill, skillsView } from '@/features/skills/skills.server'
import { AppError } from '@/lib/app-error'
import { authMiddleware } from '@/lib/auth'
import { requireRole } from '@/lib/auth.server'
import { db, evidenceRefs, must, type Db } from '@/lib/store.server'

/** Coaches see only the plants assigned to them. */
function assignedSite(store: Db, user: User, siteId: string) {
  requireRole(user, COACH_ROLES)
  if (!user.siteIds.includes(siteId)) throw new AppError('FORBIDDEN', 'plant not assigned')
  return must(
    store.sites.find((s) => s.id === siteId),
    'site',
  )
}

export const listPlants = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    requireRole(user, COACH_ROLES)
    const store = await db()
    return user.siteIds.flatMap((siteId) => {
      const site = store.sites.find((s) => s.id === siteId)
      const view = levelView(store, siteId)
      if (!site || !view) return []
      const profile = store.plantProfiles.find((p) => p.siteId === siteId)
      return [
        {
          siteId,
          plant: store.tenants.find((t) => t.id === site.tenantId)?.name ?? '',
          site: site.name,
          cluster: profile?.cluster ?? '',
          tier: view.tier,
          level: view.level,
          baseline: view.baseline?.status ?? ('not_started' as const),
          skillsOn: store.plantSkills.filter((p) => p.siteId === siteId && p.enabled).length,
          mapped: store.processMaps.some((m) => m.siteId === siteId && m.state === 'future'),
        },
      ]
    })
  })

export const getPlant = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ siteId: Id }))
  .handler(async ({ data, context: { user } }) => {
    const store = await db()
    const site = assignedSite(store, user, data.siteId)
    const baseline = store.baselines.find((b) => b.siteId === site.id)
    const maps = store.processMaps.filter((m) => m.siteId === site.id)
    return {
      plant: store.tenants.find((t) => t.id === site.tenantId)?.name ?? '',
      site: site.name,
      profile: store.plantProfiles.find((p) => p.siteId === site.id),
      level: levelView(store, site.id),
      baseline,
      current: maps.find((m) => m.state === 'current'),
      future: maps.find((m) => m.state === 'future'),
      skills: skillsView(store, site.id),
      evidence: evidenceRefs(store, baseline?.dimensions.flatMap((d) => d.evidenceIds) ?? []),
      timeZone: site.timeZone,
    }
  })

/** Recipe picker: the coach switches on a skill at a leak point; the switch is logged in the audit chain. */
export const switchOnSkill = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ siteId: Id, skill: SkillKey }))
  .handler(async ({ data, context: { user } }) => {
    const store = await db()
    const site = assignedSite(store, user, data.siteId)
    await setSkill(store, user, site.id, site.tenantId, data.skill, true)
    return { ok: true }
  })
