import { Brand } from '@/components/app/brand'
import { LanguageSwitcher } from '@/components/app/language-switcher'
import { HandshakeArt } from '@/features/landing/components/handshake-art'
import { Transformation } from '@/features/landing/components/transformation'
import { type MessageId, useT } from '@/lib/i18n'
import { DemoAccounts } from './demo-accounts'
import { SignInForm } from './sign-in-form'

const STATS = ['ladder', 'payment', 'verify'] as const
const AUDIENCES = [
  { key: 'supplier', tone: 'bg-teal-soft text-teal' },
  { key: 'buyer', tone: 'bg-accent-soft text-accent' },
  { key: 'coach', tone: 'bg-warn-soft text-warn-ink' },
] as const

export function LoginPage() {
  const t = useT()
  return (
    <div className="min-h-dvh bg-subtle">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-navy/95 text-on-navy backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between pr-1 pl-4 sm:px-6">
          <Brand className="text-sm" />
          <nav className="flex items-center gap-1">
            <a
              href="#demo"
              className="hidden rounded-md px-3 py-2 text-sm text-on-navy-muted hover:text-on-navy sm:inline"
            >
              {t('landing.nav.demo')}
            </a>
            <LanguageSwitcher tone="navy" />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-on-navy">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(60% 60% at 85% 20%, rgba(79,209,191,0.35), transparent 70%), radial-gradient(50% 60% at 10% 90%, rgba(26,115,232,0.45), transparent 70%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="lp-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-on-navy-muted">
              <span className="size-1.5 rounded-full bg-teal" />
              {t('landing.hero.eyebrow')}
            </p>
            <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-on-navy sm:text-5xl">
              {t('landing.hero.title')}
            </h1>
            <p className="mt-4 max-w-xl text-base text-on-navy-muted sm:text-lg">
              {t('landing.hero.body')}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#demo"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-teal px-5 text-sm font-semibold text-navy shadow-lg shadow-teal/20 hover:brightness-110"
              >
                {t('landing.hero.ctaDemo')}
              </a>
              <a
                href="#ladder"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 px-5 text-sm font-semibold text-on-navy hover:bg-white/10"
              >
                {t('landing.hero.ctaLadder')}
              </a>
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              {STATS.map((stat) => (
                <div key={stat}>
                  <dt className="text-xl font-bold text-on-navy sm:text-2xl">
                    {t(`landing.stat.${stat}.value` as MessageId)}
                  </dt>
                  <dd className="mt-1 text-xs text-on-navy-muted sm:text-sm">
                    {t(`landing.stat.${stat}.label` as MessageId)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <HandshakeArt className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl ring-1 shadow-black/40 ring-white/10" />
        </div>
      </section>

      {/* Transformation */}
      <section id="ladder" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">
            {t('landing.ladder.eyebrow')}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t('landing.ladder.title')}
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base">{t('landing.ladder.body')}</p>
        </div>
        <div className="mt-6">
          <Transformation />
        </div>
      </section>

      {/* Who it is for */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3">
          {AUDIENCES.map(({ key, tone }) => (
            <article key={key} className="rounded-xl border border-line p-5">
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
              >
                {t(`landing.for.${key}.tag` as MessageId)}
              </span>
              <h3 className="mt-3 text-base">{t(`landing.for.${key}.title` as MessageId)}</h3>
              <p className="mt-1 text-sm text-muted">{t(`landing.for.${key}.body` as MessageId)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Sign in */}
      <main
        id="demo"
        className="mx-auto grid max-w-6xl scroll-mt-16 gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.2fr] lg:gap-12"
      >
        <section>
          <h2 className="text-xl">{t('login.title')}</h2>
          <p className="mt-2 text-sm text-muted">{t('login.subtitle')}</p>
          <SignInForm />
        </section>
        <section>
          <h2 className="text-base">{t('login.demo.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('login.demo.body')}</p>
          <DemoAccounts />
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        {t('landing.footer')}
      </footer>
    </div>
  )
}
