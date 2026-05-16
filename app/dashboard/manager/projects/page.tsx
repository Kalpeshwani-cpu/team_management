import ProjectsView from '@/components/dashboard/projects-view'
import { requireManagerOrAdmin } from '@/lib/require-role'

export default async function ManagerProjectsPage() {
  const { user } = await requireManagerOrAdmin()
  return <ProjectsView userId={user.id} role="manager" />
}
