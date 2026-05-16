import { getCurrentUser } from '@/lib/auth'
import { getTasks } from '@/lib/db'
import { Button } from '@/components/ui/button'
import TasksList from '@/components/tasks/list'
import CreateTaskDialog from '@/components/tasks/create-dialog'

export default async function TasksPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <div className="p-8">Loading...</div>
  }

  const tasks = await getTasks(undefined, currentUser.id)

  return (
    <div className="p-8">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tasks</h1>
            <p className="text-muted-foreground">
              View and manage all your tasks
            </p>
          </div>
          <CreateTaskDialog userId={currentUser.id} />
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No tasks assigned yet.
            </p>
          </div>
        ) : (
          <TasksList tasks={tasks} />
        )}
      </div>
    </div>
  )
}
