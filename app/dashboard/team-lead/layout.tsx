import { requireRole } from '@/lib/require-role'

export default async function TeamLeadDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['team_lead', 'project_lead', 'admin', 'manager'])
  return <>{children}</>
}
