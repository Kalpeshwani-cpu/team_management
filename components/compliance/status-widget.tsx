'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ComplianceReport {
  id: string
  project_id: string
  compliance_type: string
  score: number
  status: string
  findings?: string
  recommendations?: string
}

export function ComplianceStatusWidget({ projectId }: { projectId: string }) {
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [projectId])

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `/api/compliance/reports?projectId=${projectId}`
      )
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching compliance reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />
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

  if (loading) {
    return <div>Loading compliance status...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Status</CardTitle>
        <CardDescription>Project compliance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No compliance reports available. Generate a report to get started.
            </p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(report.status)}
                    <div>
                      <p className="font-medium capitalize">
                        {report.compliance_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score: {report.score}%
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.charAt(0).toUpperCase() +
                      report.status.slice(1)}
                  </Badge>
                </div>
                {report.findings && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {report.findings}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
