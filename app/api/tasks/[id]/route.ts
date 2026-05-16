import { getCurrentUser } from '@/lib/auth'
import { getTaskById } from '@/lib/db'
import { canManageProject } from '@/lib/policies'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await getTaskById(id)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const isAssignee = task.assignedTo === currentUser.id
    const isCreator = task.createdBy === currentUser.id
    const canManage = await canManageProject(currentUser, task.projectId)

    if (!isAssignee && !isCreator && !canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch task' },
      { status: 500 }
    )
  }
}
