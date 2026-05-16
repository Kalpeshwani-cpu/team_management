import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { requireAuth, getDisplayName } from '@/lib/require-role'
import { getProjects, getTasks } from '@/lib/db'
import { FolderOpen, CheckSquare } from 'lucide-react'

export default async function DeveloperDashboardPage() {
  const user = await requireAuth()
  const projects = await getProjects(user.id)
  const tasks = await getTasks(undefined, user.id)
  const myOpen = tasks.filter((t) => t.status !== 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome, {getDisplayName(user)}. Focus on your assigned work and projects.
      </p>

      <section className="grid md:grid-cols-3 gap-4 mb-8">
        <StatCard label="My Projects" value={projects.length} icon={FolderOpen} />
        <StatCard label="Open Tasks" value={myOpen} icon={CheckSquare} />
        <StatCard label="In Progress" value={inProgress} icon={CheckSquare} />
      </section>

      <section className="grid lg:grid-cols-2 gap-8">
        <article>
          <header className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Tasks</h2>
            <Link href="/dashboard/developer/tasks">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </header>
          <ul className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <li
                key={task.id}
                className="p-4 border border-border rounded-lg"
              >
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-muted-foreground">
                  {task.project?.name} · {task.status} · {task.priority}
                </p>
              </li>
            ))}
            {tasks.length === 0 && (
              <p className="text-muted-foreground">No tasks assigned yet.</p>
            )}
          </ul>
        </article>

        <article>
          <header className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Projects</h2>
            <Link href="/dashboard/developer/projects">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </header>
          <ul className="space-y-3">
            {projects.slice(0, 5).map((p) => (
              <li key={p.id} className="p-4 border border-border rounded-lg">
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.status}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}
