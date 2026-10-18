import type { QueryClient } from '@tanstack/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { Toaster } from '@/components/ui/toaster'
import { messagesQuery, sessionQuery } from '@/features/session/queries'
import appCss from '@/styles/app.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ context }) => ({
    session: await context.queryClient.ensureQueryData(sessionQuery()),
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(messagesQuery(context.session.locale)),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#0b1f3a' },
      { title: 'GembaLeap' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  }),
  component: RootComponent,
  errorComponent: RootError,
})

function RootComponent() {
  const { session } = Route.useRouteContext()
  const { data: messages } = useSuspenseQuery(messagesQuery(session.locale))
  return (
    <RootDocument lang={session.locale}>
      <IntlProvider locale={session.locale} defaultLocale="en" messages={messages}>
        <Outlet />
        <Toaster />
      </IntlProvider>
    </RootDocument>
  )
}

function RootDocument({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <html lang={lang}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

/** Shown when the session or messages cannot load, so it cannot use translations. */
function RootError() {
  return (
    <RootDocument lang="en">
      <main className="mx-auto max-w-md p-8">
        <h1 className="text-xl">GembaLeap is unavailable</h1>
        <p className="mt-2 text-muted">
          Reload the page. If it keeps failing, the service may be restarting.
        </p>
      </main>
    </RootDocument>
  )
}
