import TasksView from '@/components/dashboard/tasks-view'
import { requireAuth } from '@/lib/require-role'

export default async function DeveloperTasksPage() {
  const user = await requireAuth()
  return <TasksView userId={user.id} role="developer" canCreate={false} />
}
