import ProjectsView from '@/components/dashboard/projects-view'
import { requireRole } from '@/lib/require-role'

export default async function ProjectLeadProjectsPage() {
  const { user } = await requireRole(['project_lead', 'admin', 'manager'])
  return <ProjectsView userId={user.id} role="project_lead" />
}
