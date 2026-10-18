import { createHmac, timingSafeEqual } from 'node:crypto'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { Locale } from '@gembaleap/schemas'
import { db } from './store.server'

/**
 * Demo session: the user id in a signed, HttpOnly cookie. Replaced in M0 by
 * verifying a Firebase ID token and reading the `tenantId` and `role` claims.
 */
const SESSION_COOKIE = 'gl_session'
const LOCALE_COOKIE = 'gl_locale'
const MAX_AGE = 60 * 60 * 12

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const

function secret(): string {
  const value = process.env.SESSION_SECRET
  if (value) return value
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET is not set')
  return 'dev-only-session-secret'
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('base64url')
}

export function issueSession(userId: string) {
  setCookie(SESSION_COOKIE, `${userId}.${sign(userId)}`, { ...cookieOptions, maxAge: MAX_AGE })
}

export function clearSession() {
  deleteCookie(SESSION_COOKIE, cookieOptions)
}

export async function currentUser() {
  const raw = getCookie(SESSION_COOKIE)
  if (!raw) return null
  const [userId = '', signature = ''] = raw.split('.')
  const expected = Buffer.from(sign(userId))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  const store = await db()
  return store.users.find((u) => u.id === userId) ?? null
}

export function readLocale() {
  const parsed = Locale.safeParse(getCookie(LOCALE_COOKIE))
  return parsed.success ? parsed.data : null
}

export function writeLocale(locale: Locale) {
  setCookie(LOCALE_COOKIE, locale, {
    ...cookieOptions,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  })
}
