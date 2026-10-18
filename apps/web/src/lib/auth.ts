import { createMiddleware } from '@tanstack/react-start'
import { AppError } from './app-error'
import { currentUser } from './session.server'

/** Attach to every server function that reads or writes tenant data. Route guards are UX only. */
export const authMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await currentUser()
  if (!user) throw new AppError('UNAUTHENTICATED')
  return next({ context: { user } })
})
