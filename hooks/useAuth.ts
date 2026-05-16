import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user || null,
    loading: status === 'loading',
    error: status === 'unauthenticated' ? 'Not authenticated' : null,
  }
}
