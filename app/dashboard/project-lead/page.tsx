import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { requireRole, getDisplayName } from '@/lib/require-role'
import { getOwnedProjects } from '@/lib/db'
import { getTasksForRole } from '@/lib/dashboard-data'
import { FolderOpen, CheckSquare, ClipboardList } from 'lucide-react'

export default async function ProjectLeadDashboardPage() {
  const { user } = await requireRole(['project_lead', 'admin', 'manager'])
  const projects = await getOwnedProjects(user.id)
  const tasks = await getTasksForRole(user.id, 'project_lead')
  const unassigned = tasks.filter((t) => !t.assignedTo).length
  const active = projects.filter((p) => p.status === 'in_progress').length

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Project Lead Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome, {getDisplayName(user)}. Own projects, build teams, and assign work.
      </p>

      <section className="grid md:grid-cols-3 gap-4 mb-8">
        <StatCard label="My Projects" value={projects.length} icon={FolderOpen} />
        <StatCard label="Active Projects" value={active} icon={FolderOpen} />
        <StatCard label="Unassigned Tasks" value={unassigned} icon={ClipboardList} />
      </section>

      <section className="flex flex-wrap gap-2 mb-8">
        <Link href="/dashboard/project-lead/projects">
          <Button>Manage Projects</Button>
        </Link>
        <Link href="/dashboard/project-lead/assignments">
          <Button variant="outline">Assign Tasks</Button>
        </Link>
        <Link href="/dashboard/project-lead/tasks">
          <Button variant="outline">All Tasks</Button>
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Your Projects</h2>
        <div className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-muted-foreground">Create a project to get started.</p>
          ) : (
            projects.slice(0, 5).map((p) => (
              <article
                key={p.id}
                className="p-4 border border-border rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {p.teamMembers?.length ?? 0} members ·{' '}
                    {p.tasks?.filter((t) => t.status !== 'completed').length ?? 0} open tasks
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-muted rounded-full">{p.status}</span>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
