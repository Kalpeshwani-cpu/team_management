'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface FailureRiskPredictionProps {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  confidenceScore: number
  factors: {
    userExperience: number
    taskComplexity: number
    teamCapacity: number
    deadline: number
  }
  mitigationStrategies: string[]
}

export function FailureRiskPrediction({
  riskScore,
  riskLevel,
  confidenceScore,
  factors,
  mitigationStrategies,
}: FailureRiskPredictionProps) {
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'from-green-50 to-green-100/50'
      case 'medium':
        return 'from-yellow-50 to-yellow-100/50'
      case 'high':
        return 'from-red-50 to-red-100/50'
    }
  }

  const getRiskBadgeVariant = () => {
    switch (riskLevel) {
      case 'low':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'high':
        return 'destructive'
    }
  }

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  }

  return (
    <Card className={`bg-gradient-to-br ${getRiskColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRiskIcon()}
            <CardTitle>Failure Risk Assessment</CardTitle>
          </div>
          <Badge variant={getRiskBadgeVariant()}>{riskLevel.toUpperCase()}</Badge>
        </div>
        <CardDescription>Prediction of task completion challenges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 font-medium">Risk Score</span>
            <span className="text-2xl font-bold text-gray-900">{Math.round(riskScore * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                riskLevel === 'high' ? 'bg-red-600' : riskLevel === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
              }`}
              style={{ width: `${riskScore * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-300 pt-3">
          <div className="bg-white/60 rounded p-2">
            <p className="text-xs text-gray-600">User Experience</p>
            <p className="text-sm font-bold text-gray-900">{Math.round(factors.userExperience * 100)}%</p>
          </div>
          <div className="bg-white/60 rounded p-2">
            <p className="text-xs text-gray-600">Task Complexity</p>
            <p className="text-sm font-bold text-gray-900">{Math.round(factors.taskComplexity * 100)}%</p>
          </div>
          <div className="bg-white/60 rounded p-2">
            <p className="text-xs text-gray-600">Deadline Risk</p>
            <p className="text-sm font-bold text-gray-900">{Math.round(factors.deadline * 100)}%</p>
          </div>
          <div className="bg-white/60 rounded p-2">
            <p className="text-xs text-gray-600">Confidence</p>
            <p className="text-sm font-bold text-gray-900">{Math.round(confidenceScore * 100)}%</p>
          </div>
        </div>

        {mitigationStrategies.length > 0 && (
          <div className="border-t border-gray-300 pt-3 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Mitigation Strategies:</p>
            <ul className="space-y-1">
              {mitigationStrategies.map((strategy, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-lg">•</span>
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
