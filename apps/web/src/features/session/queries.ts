import type { Locale } from '@gembaleap/schemas'
import { queryOptions } from '@tanstack/react-query'
import { getMessages, getSession, listDemoAccounts } from './api'

export const sessionKeys = {
  all: ['session'] as const,
  current: () => [...sessionKeys.all, 'current'] as const,
  messages: (locale: Locale) => [...sessionKeys.all, 'messages', locale] as const,
  demoAccounts: () => [...sessionKeys.all, 'demo-accounts'] as const,
}

export const sessionQuery = () =>
  queryOptions({
    queryKey: sessionKeys.current(),
    queryFn: () => getSession(),
    staleTime: Infinity,
  })

export const messagesQuery = (locale: Locale) =>
  queryOptions({
    queryKey: sessionKeys.messages(locale),
    queryFn: () => getMessages({ data: { locale } }),
    staleTime: Infinity,
  })

export const demoAccountsQuery = () =>
  queryOptions({
    queryKey: sessionKeys.demoAccounts(),
    queryFn: () => listDemoAccounts(),
    staleTime: Infinity,
  })
