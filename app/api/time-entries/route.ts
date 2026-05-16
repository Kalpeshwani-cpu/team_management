import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = request.nextUrl.searchParams.get('taskId')

    // Since time_entries table doesn't exist in Prisma schema, use MonitoringLog
    const whereClause: any = {
      userId: session.user.id,
      action: 'time_entry'
    }

    if (taskId) {
      whereClause.entityId = taskId
    }

    const logs = await prisma.monitoringLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedData = logs.map(log => {
      let parsedDetails: any = typeof log.details === 'string' ? JSON.parse(log.details) : (log.details || {})
      
      return {
        id: log.id,
        user_id: log.userId,
        task_id: log.entityId,
        hours_worked: parsedDetails.hoursWorked || 0,
        description: parsedDetails.description || '',
        work_date: parsedDetails.workDate || log.createdAt.toISOString(),
        entry_type: 'actual',
        created_at: log.createdAt,
        users: {
          first_name: log.user.name?.split(' ')[0] || '',
          last_name: log.user.name?.split(' ').slice(1).join(' ') || '',
          email: log.user.email
        }
      }
    })

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, hoursWorked, description, workDate } = await request.json()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    if (!taskId || !hoursWorked || !workDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (hoursWorked <= 0) {
      return NextResponse.json(
        { error: 'Hours worked must be greater than 0' },
        { status: 400 }
      )
    }

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user is assigned to task
    if (task.assignedTo !== session.user.id && task.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Not assigned to this task' },
        { status: 403 }
      )
    }

    // Create time entry using MonitoringLog
    const details = {
      hoursWorked,
      description,
      workDate
    }

    const log = await prisma.monitoringLog.create({
      data: {
        userId: session.user.id,
        action: 'time_entry',
        entityType: 'task',
        entityId: taskId,
        details: details
      }
    })

    const entry = {
      id: log.id,
      task_id: taskId,
      user_id: session.user.id,
      hours_worked: hoursWorked,
      description,
      work_date: workDate,
      entry_type: 'actual',
      created_at: log.createdAt
    }

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating time entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
