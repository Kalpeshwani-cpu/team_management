import { requireAuth } from '@/lib/require-role'

export default async function DeveloperDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <>{children}</>
}
