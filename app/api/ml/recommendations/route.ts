import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { getMLRecommendations, getCachedRecommendations, cacheRecommendations } from '@/lib/ml-recommendations'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Check if user owns the task
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

    if (task.project.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check cache first
    const cachedRecommendations = await getCachedRecommendations(taskId)
    if (cachedRecommendations) {
      return NextResponse.json({
        recommendations: cachedRecommendations,
        cached: true,
      })
    }

    // Get task features
    const taskFeatures = await prisma.taskFeatureVector.findUnique({
      where: { taskId: taskId }
    })

    if (!taskFeatures) {
      return NextResponse.json({ error: 'Task features not found' }, { status: 404 })
    }

    // Get all user vectors
    const userVectors = await prisma.userFeatureVector.findMany({
      take: 100
    })

    if (!userVectors || userVectors.length === 0) {
      return NextResponse.json({ error: 'No user vectors available' }, { status: 400 })
    }

    // Generate recommendations
    const recommendations = await getMLRecommendations(
      taskId,
      {
        taskId,
        featureVector: taskFeatures.featureVector,
        complexityScore: taskFeatures.complexityScore,
        requiredSkills: taskFeatures.requiredSkills,
        requiredQualifications: taskFeatures.requiredQualifications,
        teamSizeRequirement: taskFeatures.teamSizeRequirement,
      },
      userVectors.map((v) => {
        const features = v.features as any;
        return {
          userId: v.userId,
          featureVector: features.feature_vector || [],
          skillTags: features.skill_tags || [],
          experienceScore: features.experience_score || 0,
          performanceScore: features.performance_score || 0,
          workloadPreference: features.workload_preference || 0,
        };
      })
    )

    // Cache the recommendations
    await cacheRecommendations(taskId, recommendations)

    return NextResponse.json({
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      cached: false,
    })
  } catch (error) {
    console.error('ML recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
