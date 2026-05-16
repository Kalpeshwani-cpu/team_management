import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import {
  predictCompletionTime,
  predictFailureRisk,
  predictQualityScore,
  storePrediction,
} from '@/lib/predictive-analytics'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId, userId, predictionType } = await request.json()

    if (!taskId || !userId || !predictionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get task details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { ownerId: true }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check authorization
    if (task.project.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let predictions: any = {}

    // Generate predictions based on type
    if (predictionType === 'all' || predictionType === 'completion_time') {
      const completionPrediction = await predictCompletionTime(
        task.estimatedHours || 8,
        userId,
        task.priority === 'critical' ? 'high' : task.priority === 'low' ? 'low' : 'medium'
      )

      predictions.completionTime = completionPrediction

      await storePrediction(
        taskId,
        userId,
        'completion_time',
        completionPrediction.estimatedHours,
        completionPrediction.confidenceScore,
        completionPrediction.factors
      )
    }

    if (predictionType === 'all' || predictionType === 'failure_risk') {
      const days = task.dueDate
        ? Math.ceil(
            (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        : 7

      // Get user performance metrics for quality score
      const userMetrics = await prisma.performanceMetric.findFirst({
        where: {
          userId: userId,
          metricType: 'completion_rate'
        },
        orderBy: {
          metricDate: 'desc'
        }
      })

      const experienceScore = userMetrics?.metricValue || 75

      const failureRiskPrediction = await predictFailureRisk(
        task.priority === 'critical' ? 'high' : task.priority === 'low' ? 'low' : 'medium',
        days,
        userId,
        experienceScore
      )

      predictions.failureRisk = failureRiskPrediction

      await storePrediction(
        taskId,
        userId,
        'failure_risk',
        failureRiskPrediction.riskScore,
        failureRiskPrediction.confidenceScore,
        {
          riskLevel: failureRiskPrediction.riskLevel,
          factors: failureRiskPrediction.factors,
          mitigationStrategies: failureRiskPrediction.mitigationStrategies,
        }
      )
    }

    if (predictionType === 'all' || predictionType === 'quality_score') {
      // Simple skill match placeholder
      const skillMatch = 0.8

      const qualityPrediction = await predictQualityScore(
        userId,
        skillMatch,
        task.priority === 'critical' ? 'high' : task.priority === 'low' ? 'low' : 'medium'
      )

      predictions.qualityScore = qualityPrediction

      await storePrediction(
        taskId,
        userId,
        'quality_score',
        qualityPrediction.expectedScore,
        qualityPrediction.confidenceScore,
        qualityPrediction.factors
      )
    }

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Predictions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
