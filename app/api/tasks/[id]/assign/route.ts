import { getCurrentUser } from '@/lib/auth'
import { logActivity } from '@/lib/db'
import { canAssignTask } from '@/lib/policies'
import prisma from '@/lib/prisma'
import { autoAssignTask } from '@/lib/task-assignment'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  assignedTo: z.string().optional(),
  autoAssign: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const allowed = await canAssignTask(currentUser, task.projectId)
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { assignedTo, autoAssign } = parsed.data
    let newAssignee = assignedTo

    if (autoAssign) {
      newAssignee = (await autoAssignTask(taskId, currentUser.id)) ?? undefined
      if (!newAssignee) {
        return NextResponse.json({ error: 'No suitable assignee found' }, { status: 400 })
      }
    } else if (!assignedTo) {
      return NextResponse.json({ error: 'Assignee required' }, { status: 400 })
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { assignedTo: newAssignee },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        project: { select: { id: true, name: true } },
      },
    })

    await prisma.taskHistory.create({
      data: {
        taskId,
        action: 'assigned',
        oldValue: task.assignedTo || '',
        newValue: newAssignee!,
        changedBy: currentUser.id,
      },
    })

    await logActivity(currentUser.id, 'ASSIGN', 'TASK', taskId, {
      assignedTo: newAssignee,
      autoAssign: !!autoAssign,
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    console.error('[TASK_ASSIGN]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign task' },
      { status: 500 }
    )
  }
}
