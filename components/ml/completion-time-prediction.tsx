'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingDown } from 'lucide-react'

interface CompletionTimePredictionProps {
  estimatedHours: number
  originalEstimate: number
  confidenceScore: number
  userSpeedMultiplier: number
}

export function CompletionTimePrediction({
  estimatedHours,
  originalEstimate,
  confidenceScore,
  userSpeedMultiplier,
}: CompletionTimePredictionProps) {
  const difference = estimatedHours - originalEstimate
  const percentDifference = ((difference / originalEstimate) * 100).toFixed(0)
  const isAccelerated = userSpeedMultiplier < 1

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle>Predicted Duration</CardTitle>
          </div>
          <Badge variant={isAccelerated ? 'default' : 'secondary'}>
            {isAccelerated ? 'Faster' : 'Longer'} by {Math.abs(percentDifference)}%
          </Badge>
        </div>
        <CardDescription>Based on historical user performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Original Estimate</p>
            <p className="text-2xl font-bold text-gray-900">{originalEstimate}h</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-600">AI Prediction</p>
            <p className="text-2xl font-bold text-blue-900">{estimatedHours}h</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-blue-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Confidence Score</span>
            <span className="text-sm font-semibold text-gray-900">{Math.round(confidenceScore * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${confidenceScore * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-md p-3 space-y-2">
          <p className="text-sm font-medium text-gray-700">User Speed Multiplier</p>
          <div className="flex items-center gap-2">
            {isAccelerated && <TrendingDown className="h-4 w-4 text-green-600" />}
            <span className="text-lg font-bold text-gray-900">{userSpeedMultiplier.toFixed(2)}x</span>
            <span className="text-sm text-gray-500">
              {isAccelerated ? 'Completes tasks faster than estimate' : 'Typically takes longer than estimate'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
