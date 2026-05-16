import { redirect } from 'next/navigation'
import { getCurrentUser, resolvePrimaryRole } from '@/lib/auth'
import { getDashboardPath } from '@/lib/roles'

export default async function DashboardRedirectPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const primaryRole = resolvePrimaryRole(user)
  redirect(getDashboardPath(primaryRole))
}
