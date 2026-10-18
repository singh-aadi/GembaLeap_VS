import type { Role } from '@gembaleap/schemas'
import {
  Camera,
  ChartColumn,
  ClipboardCheck,
  Factory,
  FileCheck,
  FileClock,
  FileWarning,
  Handshake,
  House,
  List,
  MessageCircleQuestion,
  MessagesSquare,
  Package,
  Radar,
  Store,
  type LucideIcon,
} from 'lucide-react'
import type { MessageId } from './i18n'
import { canOpen, type Section, type Side } from './roles'

/** Sections that have an index page; detail-only sections cannot be nav targets. */
type NavSection = Exclude<Section, '/b/passports' | '/s/cycles'>

export type NavItem = { to: NavSection; label: MessageId; short: MessageId; icon: LucideIcon }
export type NavGroup = { label: MessageId; items: NavItem[] }

const SUPPLIER_NAV: NavGroup[] = [
  {
    label: 'nav.group.operate',
    items: [
      { to: '/s/home', label: 'nav.home', short: 'nav.home', icon: House },
      { to: '/s/checklist', label: 'nav.checklist', short: 'nav.checklist', icon: ClipboardCheck },
      { to: '/s/capture', label: 'nav.capture', short: 'nav.capture', icon: Camera },
      { to: '/s/events', label: 'nav.events', short: 'nav.events', icon: List },
      {
        to: '/s/shift-brief',
        label: 'nav.shiftBrief',
        short: 'nav.shiftBrief.short',
        icon: FileClock,
      },
    ],
  },
  {
    label: 'nav.group.improve',
    items: [
      { to: '/s/maturity', label: 'nav.maturity', short: 'nav.maturity', icon: ChartColumn },
      { to: '/s/audit', label: 'nav.audit', short: 'nav.audit', icon: MessagesSquare },
      { to: '/s/bottlenecks', label: 'nav.bottlenecks', short: 'nav.bottlenecks', icon: Radar },
    ],
  },
  {
    label: 'nav.group.trust',
    items: [
      { to: '/s/reports', label: 'nav.reports', short: 'nav.reports.short', icon: FileCheck },
      { to: '/s/lots', label: 'nav.lots', short: 'nav.lots.short', icon: Package },
      { to: '/s/ncr', label: 'nav.ncr', short: 'nav.ncr', icon: FileWarning },
      { to: '/s/sharing', label: 'nav.sharing', short: 'nav.sharing', icon: Handshake },
      { to: '/s/ask', label: 'nav.ask', short: 'nav.ask.short', icon: MessageCircleQuestion },
    ],
  },
]

const BUYER_NAV: NavGroup[] = [
  {
    label: 'nav.group.supplyBase',
    items: [
      { to: '/b/suppliers', label: 'nav.suppliers', short: 'nav.suppliers', icon: Factory },
      { to: '/b/reports', label: 'nav.reports', short: 'nav.reports.short', icon: FileCheck },
      { to: '/b/ncr', label: 'nav.ncr', short: 'nav.ncr', icon: FileWarning },
    ],
  },
  {
    label: 'nav.group.discover',
    items: [
      { to: '/b/sourcing', label: 'nav.sourcing', short: 'nav.sourcing', icon: Store },
      { to: '/b/ask', label: 'nav.ask', short: 'nav.ask.short', icon: MessageCircleQuestion },
    ],
  },
]

/** Bottom-tab order on phones. Anything else sits under "More". */
const MOBILE_TABS: Record<Role, NavSection[]> = {
  supplier_owner: ['/s/home', '/s/checklist', '/s/capture', '/s/reports'],
  line_lead: ['/s/home', '/s/checklist', '/s/capture', '/s/events', '/s/shift-brief'],
  supplier_quality: ['/s/home', '/s/checklist', '/s/reports', '/s/lots'],
  buyer_quality: ['/b/suppliers', '/b/reports', '/b/ncr', '/b/ask'],
  buyer_procurement: ['/b/suppliers', '/b/sourcing', '/b/ask'],
}

export function navFor(role: Role, side: Side): NavGroup[] {
  const groups = side === 'supplier' ? SUPPLIER_NAV : BUYER_NAV
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => canOpen(role, i.to)) }))
    .filter((g) => g.items.length > 0)
}

export function mobileTabsFor(role: Role, side: Side) {
  const items = navFor(role, side).flatMap((g) => g.items)
  const tabs = MOBILE_TABS[role].flatMap((to) => items.filter((i) => i.to === to))
  const overflow = items.filter((i) => !tabs.includes(i))
  return { tabs, overflow }
}
