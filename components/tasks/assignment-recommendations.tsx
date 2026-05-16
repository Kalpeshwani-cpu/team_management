'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

interface Recommendation {
  userId: string
  score: number
  qualifications: number
  experience: number
  workload: number
  department: number
}

export function AssignmentRecommendations({ taskId }: { taskId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [taskId])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/recommendations`)
      const data = await response.json()
      setRecommendations(data)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoAssign = async () => {
    setAssigning(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto-assign' }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error assigning task:', error)
    } finally {
      setAssigning(false)
    }
  }

  const handleAssign = async (userId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', assigneeId: userId }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error assigning task:', error)
    }
  }

  if (loading) {
    return <div>Loading recommendations...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Smart Recommendations
        </CardTitle>
        <CardDescription>AI-powered assignee suggestions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleAutoAssign}
          disabled={assigning}
          className="w-full"
          variant="default"
        >
          {assigning ? 'Assigning...' : 'Auto-Assign Best Fit'}
        </Button>

        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={rec.userId} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">Recommendation #{index + 1}</p>
                  <p className="text-sm text-muted-foreground">
                    Overall Match: {rec.score}%
                  </p>
                </div>
                <Badge variant="outline">Score: {rec.score}%</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Qualifications</p>
                  <p className="font-medium">{rec.qualifications}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{rec.experience}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Workload</p>
                  <p className="font-medium">{rec.workload}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{rec.department}%</p>
                </div>
              </div>

              <Button
                onClick={() => handleAssign(rec.userId)}
                size="sm"
                className="w-full"
              >
                Assign to This Person
              </Button>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recommendations available
          </p>
        )}
      </CardContent>
    </Card>
  )
}
