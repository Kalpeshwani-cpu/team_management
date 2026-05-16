import prisma from '@/lib/prisma'

interface UserCandidate {
  userId: string
  score: number
  qualifications: number
  experience: number
  workload: number
  department: number
}

export async function calculateTaskAssignmentScore(
  candidates: any[],
  task: any,
  weights = {
    qualification: 0.4,
    experience: 0.3,
    workload: 0.2,
    department: 0.1,
  }
): Promise<UserCandidate[]> {
  const scoredCandidates: UserCandidate[] = []

  for (const candidate of candidates) {
    let qualScore = 100 // Mocked since user_qualifications is not in schema
    let expScore = 0
    let workloadScore = 0
    let deptScore = 0

    // Calculate experience score based on completed tasks
    const completedTasksCount = await prisma.task.count({
      where: {
        assignedTo: candidate.id,
        status: 'completed'
      }
    })

    expScore = Math.min((completedTasksCount) / 10 * 100, 100)

    // Calculate workload score (lower is better)
    const activeTaskCount = await prisma.task.count({
      where: {
        assignedTo: candidate.id,
        status: {
          in: ['todo', 'in_progress', 'review']
        }
      }
    })

    workloadScore = Math.max(100 - (activeTaskCount * 20), 0)

    // Calculate department match score
    if (task.projectId && candidate.departmentId) {
      // Mocked department logic as Task doesn't have department_id directly
      deptScore = 100 
    }

    const totalScore =
      qualScore * weights.qualification +
      expScore * weights.experience +
      workloadScore * weights.workload +
      deptScore * weights.department

    scoredCandidates.push({
      userId: candidate.id,
      score: Math.round(totalScore),
      qualifications: Math.round(qualScore),
      experience: Math.round(expScore),
      workload: Math.round(workloadScore),
      department: Math.round(deptScore),
    })
  }

  return scoredCandidates.sort((a, b) => b.score - a.score)
}

export async function recommendTaskAssignees(
  taskId: string,
  numberOfSuggestions = 3
): Promise<UserCandidate[]> {
  // Get task details
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  })

  if (!task) {
    throw new Error('Task not found')
  }

  // Get all active users
  const users = await prisma.user.findMany({
    where: { isActive: true }
  })

  if (!users || users.length === 0) {
    throw new Error('No active users found')
  }

  // Calculate scores for all users
  const scoredUsers = await calculateTaskAssignmentScore(users, task)

  // Return top N suggestions
  return scoredUsers.slice(0, numberOfSuggestions)
}

export async function autoAssignTask(taskId: string, currentUserId?: string): Promise<string | null> {
  const recommendations = await recommendTaskAssignees(taskId, 1)

  if (recommendations.length === 0) {
    return null
  }

  const assigneeId = recommendations[0].userId

  // Update task with assignment
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  
  if (!task) throw new Error('Task not found')

  await prisma.task.update({
    where: { id: taskId },
    data: {
      assignedTo: assigneeId,
    }
  })

  // Record history
  if (currentUserId) {
    await prisma.taskHistory.create({
      data: {
        taskId: taskId,
        action: 'assigned',
        oldValue: task.assignedTo || '',
        newValue: assigneeId,
        changedBy: currentUserId,
      }
    })
  }

  // Create notification
  await prisma.notification.create({
    data: {
      userId: assigneeId,
      title: 'Task Assigned',
      message: `You have been assigned a new task`,
      notificationType: 'task_assigned',
      relatedEntityType: 'task',
      relatedEntityId: taskId,
    }
  })

  return assigneeId
}
