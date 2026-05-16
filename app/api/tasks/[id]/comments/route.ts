import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
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

    const comments = await prisma.taskComment.findMany({
      where: { taskId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Map to the expected format (snake_case)
    const formattedData = comments.map(comment => ({
      id: comment.id,
      task_id: comment.taskId,
      user_id: comment.userId,
      content: comment.content,
      attachment_url: comment.attachmentUrl,
      created_at: comment.createdAt,
      users: {
        id: comment.user.id,
        first_name: comment.user.firstName,
        last_name: comment.user.lastName,
        email: comment.user.email,
        avatar_url: comment.user.image
      }
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching comments:', error)
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
    const { content, attachmentUrl } = await request.json()

    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, title: true, assignedTo: true }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Create comment
    const comment = await prisma.taskComment.create({
      data: {
        taskId: id,
        userId: session.user.id,
        content,
        attachmentUrl,
      }
    })

    // Create notification for task assignee
    if (task.assignedTo && task.assignedTo !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: task.assignedTo,
          title: 'New Comment',
          message: `New comment on task "${task.title}"`,
          notificationType: 'comment_added',
          relatedEntityType: 'task',
          relatedEntityId: id,
        }
      })
    }

    const responseData = {
      id: comment.id,
      task_id: comment.taskId,
      user_id: comment.userId,
      content: comment.content,
      attachment_url: comment.attachmentUrl,
      created_at: comment.createdAt
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
