import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // Validate status transition
    const validStatuses = ['todo', 'in_progress', 'review', 'completed', 'blocked']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get current task
    const task = await prisma.task.findUnique({
      where: { id },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check permissions (must be creator or assignee)
    if (task.createdBy !== userId && task.assignedTo !== userId) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    })

    // Record history
    await prisma.taskHistory.create({
      data: {
        taskId: id,
        action: 'status_changed',
        oldValue: task.status,
        newValue: status,
        changedBy: userId,
      },
    })

    // Create notification if task completed
    if (status === 'completed' && task.assignedTo) {
      await prisma.notification.create({
        data: {
          userId: task.assignedTo,
          title: 'Task Completed',
          message: `Task "${task.title}" has been completed`,
          notificationType: 'task_updated',
          relatedEntityType: 'task',
          relatedEntityId: id,
        },
      })
    }

    return NextResponse.json(updatedTask)
  } catch (error: any) {
    console.error('Error updating task status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
