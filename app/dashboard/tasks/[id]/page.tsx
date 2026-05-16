'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskHistory } from '@/components/tasks/task-history'
import { TimeTrackingWidget } from '@/components/tasks/time-tracking-widget'
import { AssignmentRecommendations } from '@/components/tasks/assignment-recommendations'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assigned_to: string
  due_date: string
  estimated_hours: number
  actual_hours: number
  created_at: string
}

export default function TaskDetailsPage() {
  const params = useParams()
  const taskId = params.id as string
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTask()
  }, [taskId])

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      const data = await response.json()
      setTask(data)
    } catch (error) {
      console.error('Error fetching task:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading task...</div>
  }

  if (!task) {
    return <div className="p-8">Task not found</div>
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
        <p className="text-muted-foreground">{task.description}</p>
        <div className="flex gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{task.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Priority</p>
            <p className={`font-medium capitalize ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p className="font-medium">{new Date(task.due_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hours</p>
            <p className="font-medium">
              {task.actual_hours || 0} / {task.estimated_hours} hours
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="assignment">Smart Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Hours</p>
                  <p className="font-medium">{task.estimated_hours}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actual Hours</p>
                  <p className="font-medium">{task.actual_hours || 'Not tracked'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <TimeTrackingWidget taskId={taskId} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <TaskHistory taskId={taskId} />
        </TabsContent>

        <TabsContent value="assignment" className="space-y-4">
          <AssignmentRecommendations taskId={taskId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
