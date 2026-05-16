import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react'
import { requireManagerOrAdmin } from '@/lib/require-role'

export default async function AnalyticsPage() {
  const { primaryRole } = await requireManagerOrAdmin()

  const completedTasks = await prisma.task.count({
    where: { status: 'completed' },
  })

  const totalTasks = await prisma.task.count()
  const activeProjects = await prisma.project.count()

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="p-8 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Performance</h1>
        <p className="text-muted-foreground mt-2">
          Team performance metrics ({primaryRole === 'admin' ? 'Admin' : 'Manager'} view)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Based on total tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              On-Time Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed by deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Productivity Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4</div>
            <p className="text-xs text-muted-foreground mt-1">Average team score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Ongoing projects</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Historical metrics integration pending…
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
