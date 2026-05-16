import prisma from '@/lib/prisma'

export interface UserVector {
  userId: string
  featureVector: number[]
  skillTags: string[]
  experienceScore: number
  performanceScore: number
  workloadPreference: 'low' | 'medium' | 'high'
}

export interface TaskVector {
  taskId: string
  featureVector: number[]
  complexityScore: number
  requiredSkills: string[]
  requiredQualifications: string[]
  teamSizeRequirement: number
}

export interface RecommendationScore {
  userId: string
  score: number
  collaborativeScore: number
  contentBasedScore: number
  performanceHistoryScore: number
  confidence: number
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    magnitudeA += vecA[i] * vecA[i]
    magnitudeB += vecB[i] * vecB[i]
  }

  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)

  if (magnitudeA === 0 || magnitudeB === 0) return 0
  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Calculate skill match score based on task requirements
 */
export function calculateSkillMatch(userSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 1

  const matchedSkills = userSkills.filter((skill) => requiredSkills.includes(skill))
  return matchedSkills.length / requiredSkills.length
}

/**
 * Collaborative filtering based on similar user assignments
 */
export async function getCollaborativeScore(
  userVector: UserVector,
  allUserVectors: UserVector[],
  taskVector: TaskVector
): Promise<number> {
  let similarUsersScore = 0
  let similarUsersCount = 0

  for (const otherUser of allUserVectors) {
    if (otherUser.userId === userVector.userId) continue

    const similarity = cosineSimilarity(userVector.featureVector, otherUser.featureVector)
    if (similarity > 0.5) {
      similarUsersScore += similarity * otherUser.performanceScore
      similarUsersCount++
    }
  }

  return similarUsersCount > 0 ? (similarUsersScore / similarUsersCount) * 0.8 + userVector.performanceScore * 0.2 : 0
}

/**
 * Content-based filtering based on task and user characteristics
 */
export function getContentBasedScore(userVector: UserVector, taskVector: TaskVector): number {
  const skillMatch = calculateSkillMatch(userVector.skillTags, taskVector.requiredSkills)
  const complexityMatch = 1 - Math.abs(userVector.experienceScore / 100 - taskVector.complexityScore / 100)
  const workloadScore = userVector.workloadPreference === 'high' ? 1 : userVector.workloadPreference === 'medium' ? 0.7 : 0.4

  return (skillMatch * 0.5 + complexityMatch * 0.3 + workloadScore * 0.2) * 100
}

/**
 * Calculate score based on performance history
 */
export function getPerformanceHistoryScore(userVector: UserVector, taskVector: TaskVector): number {
  const performanceBonus = userVector.performanceScore * 0.8
  const experienceBonus = Math.min(userVector.experienceScore / 100, 1) * 20
  const complexityAlignment = 1 - Math.abs(userVector.experienceScore / 100 - taskVector.complexityScore / 100)

  return performanceBonus + experienceBonus + complexityAlignment * 20
}

/**
 * Generate ML-powered recommendations for a task
 */
export async function getMLRecommendations(
  taskId: string,
  taskVector: TaskVector,
  allUserVectors: UserVector[]
): Promise<RecommendationScore[]> {
  const recommendations: RecommendationScore[] = []

  for (const userVector of allUserVectors) {
    const collaborativeScore = await getCollaborativeScore(userVector, allUserVectors, taskVector)
    const contentBasedScore = getContentBasedScore(userVector, taskVector)
    const performanceHistoryScore = getPerformanceHistoryScore(userVector, taskVector)

    // Hybrid scoring: 40% collaborative, 40% content-based, 20% performance history
    const finalScore = collaborativeScore * 0.4 + contentBasedScore * 0.4 + performanceHistoryScore * 0.2

    // Calculate confidence based on data quality
    const confidence = Math.min(
      (userVector.skillTags.length * 0.3 + userVector.performanceScore / 100 * 0.7) * 100,
      100
    ) / 100

    recommendations.push({
      userId: userVector.userId,
      score: finalScore,
      collaborativeScore,
      contentBasedScore,
      performanceHistoryScore,
      confidence,
    })
  }

  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score)
}

/**
 * Cache recommendations in database
 */
export async function cacheRecommendations(
  taskId: string,
  recommendations: RecommendationScore[]
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // Cache for 24 hours
  
  const cacheData = {
    recommended_users: recommendations,
    recommendation_metadata: {
      totalCandidates: recommendations.length,
      topScore: recommendations[0]?.score || 0,
      averageScore: recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length,
      generatedAt: new Date().toISOString(),
    },
    algorithm_version: 'v1',
  }

  await prisma.mLRecommendation.upsert({
    where: { taskId },
    create: {
      taskId,
      data: cacheData,
      expiresAt,
    },
    update: {
      data: cacheData,
      expiresAt,
    },
  })
}

/**
 * Get cached recommendations if available
 */
export async function getCachedRecommendations(taskId: string): Promise<RecommendationScore[] | null> {
  const recommendation = await prisma.mLRecommendation.findUnique({
    where: { taskId },
  })

  if (!recommendation || !recommendation.data) return null

  // Check if cache has expired
  if (recommendation.expiresAt < new Date()) {
    return null
  }

  const data = recommendation.data as Record<string, any>
  return data.recommended_users as RecommendationScore[]
}
