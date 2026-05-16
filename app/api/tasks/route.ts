import { getCurrentUser } from '@/lib/auth'
import { getTasks, createTask, logActivity } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projectId = request.nextUrl.searchParams.get('projectId')
    const tasks = await getTasks(projectId || undefined, currentUser.id)

    return NextResponse.json(tasks)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      projectId,
      title,
      description,
      priority,
      assignedTo,
      dueDate,
    } = await request.json()

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and task title are required' },
        { status: 400 }
      )
    }

    const task = await createTask(
      projectId,
      title,
      currentUser.id,
      description,
      priority,
      assignedTo
    )

    // Log activity
    await logActivity(
      currentUser.id,
      'CREATE',
      'TASK',
      task?.id,
      { projectId, title, description, priority, assignedTo, dueDate }
    )

    return NextResponse.json(task, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    )
  }
}
