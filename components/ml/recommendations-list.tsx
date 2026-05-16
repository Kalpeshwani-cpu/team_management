'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, Award } from 'lucide-react'
import { useState } from 'react'

interface Recommendation {
  userId: string
  userName?: string
  score: number
  collaborativeScore: number
  contentBasedScore: number
  performanceHistoryScore: number
  confidence: number
}

interface RecommendationsListProps {
  recommendations: Recommendation[]
  onSelect?: (userId: string) => void
  loading?: boolean
}

export function RecommendationsList({ recommendations, onSelect, loading = false }: RecommendationsListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (userId: string) => {
    setSelectedId(userId)
    onSelect?.(userId)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>AI Recommendations</CardTitle>
          </div>
          <CardDescription>Loading recommendations...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <CardTitle>AI-Powered Recommendations</CardTitle>
        </div>
        <CardDescription>
          Top {recommendations.length} candidates based on skills, experience, and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={rec.userId}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedId === rec.userId ? 'border-purple-600 bg-purple-100/50' : 'border-transparent bg-white/70 hover:border-purple-300'
              }`}
              onClick={() => handleSelect(rec.userId)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-100">
                    #{index + 1}
                  </Badge>
                  <span className="font-semibold text-gray-900">{rec.userName || rec.userId}</span>
                  {rec.score > 85 && <Award className="h-4 w-4 text-yellow-500" />}
                </div>
                <Badge variant={rec.score > 85 ? 'default' : rec.score > 70 ? 'secondary' : 'outline'}>
                  {Math.round(rec.score)}/100
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2 text-sm">
                <div className="bg-blue-50 rounded p-2">
                  <p className="text-xs text-gray-600">Collaborative</p>
                  <p className="font-bold text-blue-900">{Math.round(rec.collaborativeScore)}</p>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <p className="text-xs text-gray-600">Content-Based</p>
                  <p className="font-bold text-green-900">{Math.round(rec.contentBasedScore)}</p>
                </div>
                <div className="bg-orange-50 rounded p-2">
                  <p className="text-xs text-gray-600">Performance</p>
                  <p className="font-bold text-orange-900">{Math.round(rec.performanceHistoryScore)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="w-full mr-3">
                  <p className="text-xs text-gray-600 mb-1">Match Confidence</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{ width: `${rec.confidence * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{Math.round(rec.confidence * 100)}%</span>
              </div>

              {selectedId === rec.userId && (
                <Button size="sm" className="w-full mt-2">
                  Assign Task
                </Button>
              )}
            </div>
          ))}

          {recommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No recommendations available for this task</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
