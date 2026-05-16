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

    const userId = request.nextUrl.searchParams.get('userId')
    const period = request.nextUrl.searchParams.get('period') || 'monthly'

    // Check permissions
    if (userId && userId !== session.user.id) {
      const userRoles = await prisma.userRole.findMany({
        where: { userId: session.user.id },
        include: { role: true }
      })

      const isAdmin = userRoles.some(ur => ur.role.name === 'admin')
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    const targetUserId = userId || session.user.id

    const data = await prisma.performanceMetric.findMany({
      where: {
        userId: targetUserId,
        period: period
      },
      orderBy: {
        metricDate: 'desc'
      }
    })

    // Map to snake_case for response compatibility if needed
    const formattedData = data.map(m => ({
      id: m.id,
      user_id: m.userId,
      metric_type: m.metricType,
      metric_value: m.metricValue,
      period: m.period,
      metric_date: m.metricDate,
      created_at: m.createdAt
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Calculate performance metrics for a user
async function calculateUserMetrics(
  userId: string,
  period: string = 'monthly'
) {
  try {
    // Get user tasks
    const tasks = await prisma.task.findMany({
      where: { assignedTo: userId },
      select: { id: true, status: true, createdAt: true, updatedAt: true, dueDate: true }
    })

    if (!tasks || tasks.length === 0) {
      return null
    }

    const now = new Date()
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
    const onTimeTasks = tasks.filter((t: any) => {
      if (t.status !== 'completed' || !t.dueDate) return false
      return new Date(t.updatedAt) <= new Date(t.dueDate)
    }).length

    const completionRate = (completedTasks / totalTasks) * 100
    const onTimePercentage = (onTimeTasks / completedTasks) * 100 || 0

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return {
      completion_rate: parseFloat(completionRate.toFixed(2)),
      on_time_percentage: parseFloat(onTimePercentage.toFixed(2)),
      metric_date: today,
    }
  } catch (error) {
    console.error('Error calculating metrics:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions for calculating metrics for other users
    if (userId && userId !== session.user.id) {
      const userRoles = await prisma.userRole.findMany({
        where: { userId: session.user.id },
        include: { role: true }
      })

      const isAdmin = userRoles.some(ur => ur.role.name === 'admin')
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    const targetUserId = userId || session.user.id
    const metrics = await calculateUserMetrics(targetUserId)

    if (!metrics) {
      return NextResponse.json(
        { error: 'No tasks found to calculate metrics' },
        { status: 400 }
      )
    }

    // Store metrics
    const data = await prisma.performanceMetric.create({
      data: {
        userId: targetUserId,
        metricType: 'completion_rate',
        period: 'monthly',
        metricDate: metrics.metric_date,
        metricValue: metrics.completion_rate,
      }
    })

    const responseData = {
      id: data.id,
      user_id: data.userId,
      metric_type: data.metricType,
      period: data.period,
      metric_date: data.metricDate,
      metric_value: data.metricValue,
      created_at: data.createdAt
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error calculating and storing metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
