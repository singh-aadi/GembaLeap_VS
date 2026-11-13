import { appendAudit, now, type Db } from '@/lib/store.server'
import type { SkillKey, User } from '@sutraos/schemas'

/** The skill library joined with one plant's switches and the leak each skill closes on its future map. */
export function skillsView(store: Db, siteId: string) {
  const future = store.processMaps.find((m) => m.siteId === siteId && m.state === 'future')
  return store.skills.map((skill) => {
    const state = store.plantSkills.find((p) => p.siteId === siteId && p.skill === skill.key)
    const step = future?.steps.find((s) => s.leak?.skill === skill.key)
    return {
      ...skill,
      enabled: state?.enabled ?? false,
      measured: state?.measured,
      runs30d: state?.runs30d ?? 0,
      recommendedAt: step?.name,
    }
  })
}

export async function setSkill(
  store: Db,
  user: User,
  siteId: string,
  tenantId: string,
  skill: SkillKey,
  enabled: boolean,
) {
  const at = now(store)
  const existing = store.plantSkills.find((p) => p.siteId === siteId && p.skill === skill)
  if (existing) {
    existing.enabled = enabled
    existing.enabledAt = enabled ? at : existing.enabledAt
  } else {
    store.plantSkills.push({
      siteId,
      skill,
      enabled,
      enabledAt: enabled ? at : undefined,
      runs30d: 0,
    })
  }
  await appendAudit(store, {
    tenantId,
    actorId: user.id,
    action: 'skill.toggle',
    objectRef: `sites/${siteId}/skills/${skill}`,
    at,
  })
}
