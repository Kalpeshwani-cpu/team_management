import { getCurrentUser } from '@/lib/auth'
import { getProjects, getTasks } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <div className="p-8">Loading...</div>
  }

  const projects = await getProjects(currentUser.id)
  const tasks = await getTasks(undefined, currentUser.id)

  const activeProjects = projects.filter(
    (p: any) => p.status === 'in_progress'
  ).length
  const activeTasks = tasks.filter((t: any) => t.status !== 'completed').length

  return (
    <div className="p-8">
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {currentUser.profile?.first_name || 'User'}!
        </h1>
        <p className="text-muted-foreground mb-8">
          Here&apos;s your project and task overview
        </p>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-2">
              Total Projects
            </div>
            <div className="text-3xl font-bold">{projects.length}</div>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-2">
              Active Projects
            </div>
            <div className="text-3xl font-bold">{activeProjects}</div>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-2">
              Total Tasks
            </div>
            <div className="text-3xl font-bold">{tasks.length}</div>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-2">
              Active Tasks
            </div>
            <div className="text-3xl font-bold">{activeTasks}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Projects</h2>
              <Link href="/dashboard/projects">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 5).map((project: any) => (
                <div
                  key={project.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Tasks</h2>
              <Link href="/dashboard/tasks">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task: any) => (
                <div
                  key={task.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : task.priority === 'high'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.project?.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
