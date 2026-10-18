import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { signOut } from '../api'

export function useSignOut() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const signOutFn = useServerFn(signOut)
  return async () => {
    await signOutFn()
    queryClient.clear()
    await router.navigate({ to: '/login' })
  }
}
