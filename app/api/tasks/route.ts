import { getCurrentUser, resolvePrimaryRole } from '@/lib/auth'
import { createTask, logActivity } from '@/lib/db'
import { getTasksForRole } from '@/lib/dashboard-data'
import { canAssignTask } from '@/lib/policies'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const taskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Task title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
})

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
    const role = resolvePrimaryRole(currentUser)
    let tasks = await getTasksForRole(currentUser.id, role)
    if (projectId) {
      tasks = tasks.filter((t) => t.projectId === projectId)
    }

    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error('[TASKS_GET]', error)
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

    const body = await request.json()
    const validation = taskSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const {
      projectId,
      title,
      description,
      priority,
      assignedTo,
      dueDate,
    } = validation.data

    if (assignedTo && !(await canAssignTask(currentUser, projectId))) {
      return NextResponse.json(
        { error: 'You cannot assign tasks on this project' },
        { status: 403 }
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
    console.error('[TASKS_POST]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    )
  }
}
