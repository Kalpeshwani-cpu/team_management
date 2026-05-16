import { requireRole } from '@/lib/require-role'

export default async function ProjectLeadDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['project_lead', 'admin', 'manager'])
  return <>{children}</>
}
