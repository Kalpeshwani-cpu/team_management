import TasksView from '@/components/dashboard/tasks-view'
import { requireRole } from '@/lib/require-role'

export default async function ProjectLeadTasksPage() {
  const { user } = await requireRole(['project_lead', 'admin', 'manager'])
  return <TasksView userId={user.id} role="project_lead" />
}
