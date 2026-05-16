import { requireManagerOrAdmin } from '@/lib/require-role'

export default async function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireManagerOrAdmin()
  return <>{children}</>
}
