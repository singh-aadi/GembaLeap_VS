import { getRouteApi } from '@tanstack/react-router'
import { LineLeadToday } from './line-lead-today'
import { OwnerHome } from './owner-home'

const route = getRouteApi('/s')

export function HomePage() {
  const { shell } = route.useRouteContext()
  return shell.user.role === 'line_lead' ? <LineLeadToday /> : <OwnerHome />
}
