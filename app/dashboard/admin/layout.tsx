import { requireRole } from '@/lib/require-role'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['admin'])
  return <>{children}</>
}
