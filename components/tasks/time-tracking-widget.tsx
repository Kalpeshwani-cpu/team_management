'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Clock } from 'lucide-react'

export function TimeTrackingWidget({ taskId }: { taskId: string }) {
  const [hoursWorked, setHoursWorked] = useState('')
  const [description, setDescription] = useState('')
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          hoursWorked: parseFloat(hoursWorked),
          description,
          workDate,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
        return
      }

      setMessage('Time entry recorded successfully!')
      setHoursWorked('')
      setDescription('')
      setWorkDate(new Date().toISOString().split('T')[0])
    } catch (error) {
      setMessage('Failed to record time entry')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Log Time
        </CardTitle>
        <CardDescription>Record hours worked on this task</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Hours Worked</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g., 2.5"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Work Date</label>
              <Input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="What work did you complete?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes('Error')
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {message}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Recording...' : 'Record Time Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
