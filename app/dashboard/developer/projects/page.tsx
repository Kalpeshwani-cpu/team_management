import ProjectsView from '@/components/dashboard/projects-view'
import { requireAuth } from '@/lib/require-role'

export default async function DeveloperProjectsPage() {
  const user = await requireAuth()
  return <ProjectsView userId={user.id} role="developer" canCreate={false} />
}
