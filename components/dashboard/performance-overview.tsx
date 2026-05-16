'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface PerformanceMetric {
  id: string
  metric_type: string
  metric_value: number
  metric_date: string
}

export function PerformanceOverview() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/performance/metrics?period=monthly')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const completionRate = metrics.find((m) => m.metric_type === 'completion_rate')?.metric_value || 0
  const onTimePercentage = metrics.find((m) => m.metric_type === 'on_time_percentage')?.metric_value || 0

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
          <CheckCircle className={`h-4 w-4 ${getMetricColor(completionRate)}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
          <p className="text-xs text-muted-foreground">of assigned tasks completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
          <Clock className={`h-4 w-4 ${getMetricColor(onTimePercentage)}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(onTimePercentage)}%</div>
          <p className="text-xs text-muted-foreground">of tasks completed on schedule</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance Trend</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12%</div>
          <p className="text-xs text-muted-foreground">improvement this month</p>
        </CardContent>
      </Card>
    </div>
  )
}
