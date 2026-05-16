import TasksView from '@/components/dashboard/tasks-view'
import { requireRole } from '@/lib/require-role'

export default async function TeamLeadTasksPage() {
  const { user } = await requireRole(['team_lead', 'project_lead', 'admin', 'manager'])
  return <TasksView userId={user.id} role="team_lead" />
}
