import TasksList from '@/components/tasks/list'
import CreateTaskDialog from '@/components/tasks/create-dialog'
import { getTasksForRole } from '@/lib/dashboard-data'
import type { SystemRole } from '@/lib/roles'

export default async function TasksView({
  userId,
  role,
  canCreate = true,
}: {
  userId: string
  role: SystemRole
  canCreate?: boolean
}) {
  const tasks = await getTasksForRole(userId, role)

  return (
    <div className="p-8 max-w-6xl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">
            {role === 'developer'
              ? 'Tasks assigned to you or created by you'
              : 'Track and manage tasks across your projects'}
          </p>
        </div>
        {canCreate && <CreateTaskDialog userId={userId} />}
      </header>
      <TasksList tasks={tasks} />
    </div>
  )
}
