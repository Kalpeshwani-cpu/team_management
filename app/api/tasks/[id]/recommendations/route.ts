import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { recommendTaskAssignees, autoAssignTask } from '@/lib/task-assignment'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (task.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const recommendations = await recommendTaskAssignees(id, 5)

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error getting task recommendations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { action, assigneeId } = await request.json()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (task.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    if (action === 'auto-assign') {
      const assignedTo = await autoAssignTask(id, session.user.id)
      return NextResponse.json({ assigned_to: assignedTo })
    } else if (action === 'assign' && assigneeId) {
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          assignedTo: assigneeId
        }
      })

      // Record history
      await prisma.taskHistory.create({
        data: {
          taskId: id,
          action: 'assigned',
          oldValue: task.assignedTo || '',
          newValue: assigneeId,
          changedBy: session.user.id,
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'Task Assigned',
          message: `You have been assigned a new task: "${task.title}"`,
          notificationType: 'task_assigned',
          relatedEntityType: 'task',
          relatedEntityId: id,
        }
      })

      return NextResponse.json({ assigned_to: assigneeId })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error assigning task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
