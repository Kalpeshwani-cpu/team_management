import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

export default async function CompliancePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Check user role
  const userRoles = await prisma.userRole.findMany({
    where: { userId: session.user.id },
    include: { role: true }
  })

  const hasAccess = userRoles.some(ur => ur.role.name === 'admin' || ur.role.name === 'manager')

  if (!hasAccess) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p>You do not have permission to view compliance reports.</p>
      </div>
    )
  }

  const roleName = userRoles.some(ur => ur.role.name === 'admin') ? 'admin' : 'manager'

  // Fetch compliance reports - using empty array for now since compliance_reports
  // table doesn't exist in Prisma schema
  const reports: any[] = []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'fail':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'fail':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance & Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Project compliance reports and status ({roleName === 'admin' ? 'Admin View' : 'Manager View'})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Passing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'pass').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === 'warning').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Compliance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <p className="font-medium">{report.projects?.name || 'Unknown Project'}</p>
                        <Badge className="text-xs capitalize">{report.compliance_type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{report.findings}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(report.status)} capitalize`}>
                      {report.status} - {report.score}%
                    </div>
                  </div>
                  {report.recommendations && (
                    <p className="text-sm bg-muted p-2 rounded italic">
                      Recommendation: {report.recommendations}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No compliance reports available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
