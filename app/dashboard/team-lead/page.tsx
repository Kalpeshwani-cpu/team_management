import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { requireRole, getDisplayName } from '@/lib/require-role'
import { getTeamLeadProjects } from '@/lib/db'
import { getTasksForRole } from '@/lib/dashboard-data'
import { Users, CheckSquare, ClipboardList } from 'lucide-react'

export default async function TeamLeadDashboardPage() {
  const { user } = await requireRole(['team_lead', 'project_lead', 'admin', 'manager'])
  const projects = await getTeamLeadProjects(user.id)
  const tasks = await getTasksForRole(user.id, 'team_lead')
  const teamSize = projects.reduce((n, p) => n + (p.teamMembers?.length ?? 0), 0)
  const pending = tasks.filter((t) => t.status !== 'completed').length

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Team Lead Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome, {getDisplayName(user)}. Coordinate your squad and distribute tasks.
      </p>

      <section className="grid md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Team Projects" value={projects.length} icon={Users} />
        <StatCard label="Team Members" value={teamSize} icon={Users} />
        <StatCard label="Open Tasks" value={pending} icon={CheckSquare} />
      </section>

      <section className="flex flex-wrap gap-2 mb-8">
        <Link href="/dashboard/team-lead/assignments">
          <Button>
            <ClipboardList className="h-4 w-4 mr-2" />
            Assign Tasks
          </Button>
        </Link>
        <Link href="/dashboard/team-lead/team">
          <Button variant="outline">View Team</Button>
        </Link>
        <Link href="/dashboard/team-lead/tasks">
          <Button variant="outline">All Tasks</Button>
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Projects You Lead</h2>
        <div className="space-y-3">
          {projects.map((p) => (
            <article key={p.id} className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">
                {p.teamMembers?.length ?? 0} members on this project
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
