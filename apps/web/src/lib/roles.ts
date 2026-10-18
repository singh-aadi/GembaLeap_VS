import { BUYER_ROLES, SUPPLIER_ROLES, type Role } from '@gembaleap/schemas'

export type Side = 'supplier' | 'buyer'

export function sideOf(role: Role): Side {
  return (SUPPLIER_ROLES as readonly Role[]).includes(role) ? 'supplier' : 'buyer'
}

export function homeOf(role: Role): '/s/home' | '/b/suppliers' {
  return sideOf(role) === 'supplier' ? '/s/home' : '/b/suppliers'
}

const ALL_SUPPLIER = SUPPLIER_ROLES
const OWNER_QUALITY = ['supplier_owner', 'supplier_quality'] as const

/** Who may open each section. Detail routes inherit the section they sit under. */
export const SECTION_ROLES = {
  '/s/home': ALL_SUPPLIER,
  '/s/checklist': ALL_SUPPLIER,
  '/s/capture': ALL_SUPPLIER,
  '/s/events': ALL_SUPPLIER,
  '/s/shift-brief': ALL_SUPPLIER,
  '/s/cycles': ALL_SUPPLIER,
  '/s/reports': OWNER_QUALITY,
  '/s/ask': OWNER_QUALITY,
  '/s/bottlenecks': OWNER_QUALITY,
  '/s/ncr': OWNER_QUALITY,
  '/s/lots': OWNER_QUALITY,
  '/s/maturity': ['supplier_owner'],
  '/s/audit': ['supplier_owner'],
  '/s/sharing': ['supplier_owner'],
  '/b/suppliers': BUYER_ROLES,
  '/b/sourcing': BUYER_ROLES,
  '/b/ask': BUYER_ROLES,
  '/b/reports': ['buyer_quality'],
  '/b/passports': ['buyer_quality'],
  '/b/ncr': ['buyer_quality'],
} as const satisfies Record<string, readonly Role[]>

export type Section = keyof typeof SECTION_ROLES

export function canOpen(role: Role, section: Section): boolean {
  return (SECTION_ROLES[section] as readonly Role[]).includes(role)
}
