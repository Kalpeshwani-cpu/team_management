import ProjectsView from '@/components/dashboard/projects-view'
import { requireRole } from '@/lib/require-role'

export default async function AdminProjectsPage() {
  const { user } = await requireRole(['admin'])
  return <ProjectsView userId={user.id} role="admin" />
}
