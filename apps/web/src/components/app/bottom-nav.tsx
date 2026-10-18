import { Link } from '@tanstack/react-router'
import { Ellipsis } from 'lucide-react'
import { useState } from 'react'
import { Sheet } from '@/components/ui/sheet'
import { useT } from '@/lib/i18n'
import type { NavItem } from '@/lib/nav'

const tab =
  'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-4 font-medium text-muted'

export function BottomNav({ tabs, overflow }: { tabs: NavItem[]; overflow: NavItem[] }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  return (
    <nav
      aria-label={t('shell.mainNav')}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {tabs.map((item) => (
        <Link key={item.to} to={item.to} className={tab} activeProps={{ className: 'text-accent' }}>
          <item.icon className="size-5" aria-hidden />
          <span className="max-w-full truncate">{t(item.short)}</span>
        </Link>
      ))}
      {overflow.length > 0 ? (
        <>
          <button type="button" className={tab} onClick={() => setOpen(true)}>
            <Ellipsis className="size-5" aria-hidden />
            {t('nav.more')}
          </button>
          <Sheet
            open={open}
            onOpenChange={setOpen}
            title={t('nav.more')}
            closeLabel={t('common.close')}
          >
            <ul className="-mx-2">
              {overflow.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center gap-3 rounded-lg px-2 text-sm text-ink hover:bg-subtle"
                  >
                    <item.icon className="size-5 text-muted" aria-hidden />
                    {t(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </Sheet>
        </>
      ) : null}
    </nav>
  )
}
