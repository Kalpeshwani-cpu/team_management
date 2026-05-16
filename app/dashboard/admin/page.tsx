import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { requireRole, getDisplayName } from '@/lib/require-role'
import { getCompanyStats, getAllProjects, getTasks } from '@/lib/db'
import { Building2, FolderOpen, Users, Shield } from 'lucide-react'

export default async function AdminDashboardPage() {
  const { user } = await requireRole(['admin'])
  const stats = await getCompanyStats()
  const projects = await getAllProjects()
  const recentTasks = (await getTasks()).slice(0, 5)

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">
        Company Overview
      </h1>
      <p className="text-muted-foreground mb-8">
        Welcome, {getDisplayName(user)}. Manage the entire organization from here.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Users" value={stats.users} icon={Users} />
        <StatCard label="Projects" value={stats.projects} icon={FolderOpen} />
        <StatCard label="Departments" value={stats.departments} icon={Building2} />
        <StatCard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          icon={Shield}
          hint="Role requests awaiting review"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/admin/role-approvals">
              <Button variant="outline">Review Role Requests</Button>
            </Link>
            <Link href="/dashboard/admin/users">
              <Button variant="outline">Manage Users</Button>
            </Link>
            <Link href="/dashboard/admin/assignments">
              <Button variant="outline">Assign Work</Button>
            </Link>
            <Link href="/dashboard/admin/departments">
              <Button variant="outline">Departments</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Completion rate: {stats.completionRate}% across {stats.tasks} tasks
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border border-border rounded-lg text-sm"
              >
                <span className="font-medium">{task.title}</span>
                <span className="text-muted-foreground"> · {task.project?.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">All Projects ({projects.length})</h2>
          <Link href="/dashboard/admin/projects">
            <Button variant="outline" size="sm">View all</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {projects.slice(0, 4).map((p) => (
            <div key={p.id} className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">
                {p.teamMembers?.length ?? 0} members · {p.status}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
