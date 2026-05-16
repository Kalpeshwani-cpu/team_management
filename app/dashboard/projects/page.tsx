import { redirect } from 'next/navigation'
import { getCurrentUser, resolvePrimaryRole } from '@/lib/auth'
import { getDashboardPath } from '@/lib/roles'

export default async function LegacyProjectsRedirect() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  redirect(`${getDashboardPath(resolvePrimaryRole(user))}/projects`)
}
