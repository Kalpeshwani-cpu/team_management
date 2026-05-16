'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

type TaskRow = {
  id: string
  title: string
  priority: string
  status: string
  project?: { id: string; name: string }
  assignee?: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null } | null
}

type Member = {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

function displayName(u: { firstName?: string | null; lastName?: string | null; email?: string | null }) {
  const n = [u.firstName, u.lastName].filter(Boolean).join(' ')
  return n || u.email || 'Unknown'
}

export default function AssignmentBoard({
  tasks,
  membersByProject,
  canAssign,
}: {
  tasks: TaskRow[]
  membersByProject: Record<string, Member[]>
  canAssign: boolean
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const assign = async (taskId: string, assignedTo: string, autoAssign = false) => {
    setBusy(taskId)
    setError(null)
    try {
      const res = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: assignedTo || undefined, autoAssign }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Assignment failed')
      }
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assignment failed')
    } finally {
      setBusy(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No tasks to assign. Create tasks in a project first.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>
      )}
      {tasks.map((task) => {
        const members = membersByProject[task.project?.id ?? ''] ?? []
        return (
          <div
            key={task.id}
            className="p-4 bg-card border border-border rounded-lg flex flex-col md:flex-row md:items-center gap-4 justify-between"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold truncate">{task.title}</h3>
                <Badge variant="outline">{task.priority}</Badge>
                <Badge variant="secondary">{task.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {task.project?.name}
                {task.assignee && (
                  <> · Assigned to {displayName(task.assignee)}</>
                )}
              </p>
            </div>
            {canAssign && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Select
                  value={task.assignee?.id ?? ''}
                  onValueChange={(v) => assign(task.id, v)}
                  disabled={busy === task.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign to…" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {displayName(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy === task.id}
                  onClick={() => assign(task.id, '', true)}
                  title="Auto-assign using workload scoring"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Auto
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
