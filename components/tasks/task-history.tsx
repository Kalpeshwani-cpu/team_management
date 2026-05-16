'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface TaskHistoryEntry {
  id: string
  action: string
  old_value?: string
  new_value?: string
  changed_by: string
  created_at: string
}

export function TaskHistory({ taskId }: { taskId: string }) {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/history`)
        const data = await response.json()
        setHistory(data)
      } catch (error) {
        console.error('Error fetching task history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [taskId])

  if (loading) {
    return <div>Loading history...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task History</CardTitle>
        <CardDescription>Track all changes to this task</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No changes yet</p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="border-l-2 border-primary pl-4 pb-4 last:pb-0"
              >
                <p className="font-medium capitalize">{entry.action}</p>
                {entry.old_value && entry.new_value && (
                  <p className="text-sm text-muted-foreground">
                    {entry.old_value} → {entry.new_value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
