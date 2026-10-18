import { DEMO_ACCOUNTS } from '@gembaleap/seed'
import { Id, Locale } from '@gembaleap/schemas'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { AppError } from '@/lib/app-error'
import { loadMessages } from '@/lib/messages.server'
import { homeOf } from '@/lib/roles'
import {
  clearSession,
  currentUser,
  issueSession,
  readLocale,
  writeLocale,
} from '@/lib/session.server'
import { db, now } from '@/lib/store.server'

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await currentUser()
  const store = await db()
  const locale = readLocale() ?? user?.locale ?? 'en'
  if (!user) return { user: null, locale, clock: now(store) }
  const tenant = store.tenants.find((t) => t.id === user.tenantId)
  const site = store.sites.find((s) => user.siteIds.includes(s.id))
  return {
    user: { id: user.id, name: user.name, title: user.title, role: user.role },
    tenant: tenant ? { id: tenant.id, name: tenant.name, city: tenant.city } : null,
    site: site ? { id: site.id, name: site.name, timeZone: site.timeZone } : null,
    locale,
    clock: now(store),
  }
})

export const getMessages = createServerFn({ method: 'GET' })
  .validator(z.object({ locale: Locale }))
  .handler(({ data }) => loadMessages(data.locale))

export const listDemoAccounts = createServerFn({ method: 'GET' }).handler(async () => {
  const store = await db()
  return DEMO_ACCOUNTS.flatMap((userId) => {
    const user = store.users.find((u) => u.id === userId)
    const tenant = store.tenants.find((t) => t.id === user?.tenantId)
    if (!user || !tenant) return []
    return [
      {
        id: user.id,
        name: user.name,
        title: user.title,
        role: user.role,
        tenant: tenant.name,
        side: tenant.kind,
      },
    ]
  })
})

export const signInDemo = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: Id }))
  .handler(async ({ data }) => {
    if (!(DEMO_ACCOUNTS as readonly string[]).includes(data.userId)) throw new AppError('FORBIDDEN')
    const store = await db()
    const user = store.users.find((u) => u.id === data.userId)
    if (!user) throw new AppError('NOT_FOUND', 'user')
    issueSession(user.id)
    return { home: homeOf(user.role) }
  })

export const requestSignInCode = createServerFn({ method: 'POST' })
  .validator(
    z.discriminatedUnion('method', [
      z.object({ method: z.literal('phone'), phone: z.string().regex(/^\+?[0-9 ]{8,16}$/) }),
      z.object({ method: z.literal('email'), email: z.email() }),
    ]),
  )
  .handler(() => {
    // Identity Platform (phone OTP, email link) is wired in M0.
    throw new AppError('AUTH_NOT_CONFIGURED')
  })

export const signOut = createServerFn({ method: 'POST' }).handler(() => {
  clearSession()
  return { ok: true }
})

export const setLocale = createServerFn({ method: 'POST' })
  .validator(z.object({ locale: Locale }))
  .handler(({ data }) => {
    writeLocale(data.locale)
    return { locale: data.locale }
  })
