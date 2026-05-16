import { redirect } from 'next/navigation'
import RoleNav from '@/components/dashboard/role-nav'
import { getCurrentUser, resolvePrimaryRole } from '@/lib/auth'
import { REQUIRE_ADMIN_APPROVAL } from '@/lib/approval-config'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is approved
  // In the new system, we check the approvalStatus from our Prisma user object
  const isAdmin = user.roles?.some((ur: any) => ur.role?.name === 'admin') || user.requestedRole === 'admin'
  const isDeveloper = user.roles?.some((ur: any) => ur.role?.name === 'developer') || user.requestedRole === 'developer'

  // If user is not approved and not admin/developer, redirect to pending approval page
  if (
    REQUIRE_ADMIN_APPROVAL &&
    user.approvalStatus !== 'approved' &&
    !isAdmin &&
    !isDeveloper
  ) {
    redirect('/pending-approval')
  }

  const primaryRole = resolvePrimaryRole(user)

  return (
    <div className="flex h-screen">
      <RoleNav primaryRole={primaryRole} />
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
