import AssignmentBoard from '@/components/assignments/assignment-board'
import CreateTaskDialog from '@/components/tasks/create-dialog'
import { getAssignmentTasks } from '@/lib/dashboard-data'
import type { SystemRole } from '@/lib/roles'

export default async function AssignmentsView({
  userId,
  role,
  title = 'Work Assignment',
  description = 'Assign tasks to team members or use auto-assign based on workload and experience.',
}: {
  userId: string
  role: SystemRole
  title?: string
  description?: string
}) {
  const { tasks, membersByProject } = await getAssignmentTasks(userId, role)

  return (
    <div className="p-8 max-w-6xl">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <CreateTaskDialog userId={userId} />
      </header>
      <AssignmentBoard
        tasks={tasks}
        membersByProject={membersByProject}
        canAssign
      />
    </div>
  )
}
