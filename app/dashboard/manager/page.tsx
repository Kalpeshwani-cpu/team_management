import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { requireManagerOrAdmin, getDisplayName } from '@/lib/require-role'
import { getCompanyStats, getDepartmentStats, getAllProjects } from '@/lib/db'
import { BarChart3, FolderOpen, Users } from 'lucide-react'

export default async function ManagerDashboardPage() {
  const { user } = await requireManagerOrAdmin()
  const stats = await getCompanyStats()
  const deptStats = await getDepartmentStats(user.departmentId ?? undefined)
  const projects = await getAllProjects()

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome, {getDisplayName(user)}. Oversee departments, projects, and team performance.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Department Users" value={deptStats.users} icon={Users} />
        <StatCard label="Department Projects" value={deptStats.projects} icon={FolderOpen} />
        <StatCard label="Company Projects" value={stats.projects} icon={FolderOpen} />
        <StatCard
          label="Task Completion"
          value={`${stats.completionRate}%`}
          icon={BarChart3}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/dashboard/manager/team">
          <Button>Manage Team</Button>
        </Link>
        <Link href="/dashboard/manager/assignments">
          <Button variant="outline">Assign Work</Button>
        </Link>
        <Link href="/dashboard/manager/analytics">
          <Button variant="outline">Analytics</Button>
        </Link>
        <Link href="/dashboard/manager/compliance">
          <Button variant="outline">Compliance</Button>
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">Active Projects</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {projects.slice(0, 6).map((p) => (
          <div key={p.id} className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-muted-foreground">
              {p.department?.name ?? 'No department'} · {p.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
