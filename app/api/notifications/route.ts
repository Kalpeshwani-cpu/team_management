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

    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    const whereClause: any = {
      userId: session.user.id
    }

    if (unreadOnly) {
      whereClause.readStatus = false
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Map to old casing if UI expects snake_case, though prisma does that via @map.
    // Let's send the expected snake_case response.
    const formattedData = notifications.map(n => ({
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      notification_type: n.notificationType,
      related_entity_type: n.relatedEntityType,
      related_entity_id: n.relatedEntityId,
      is_read: n.readStatus,
      read_at: n.createdAt, // fallback since readAt doesn't exist
      created_at: n.createdAt
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationIds, isRead } = await request.json()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!Array.isArray(notificationIds) || typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id
      },
      data: {
        readStatus: isRead
      }
    })

    // Return the updated notifications
    const updatedNotifications = await prisma.notification.findMany({
      where: {
        id: { in: notificationIds }
      }
    })
    
    const formattedData = updatedNotifications.map(n => ({
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      notification_type: n.notificationType,
      related_entity_type: n.relatedEntityType,
      related_entity_id: n.relatedEntityId,
      is_read: n.readStatus,
      read_at: n.createdAt,
      created_at: n.createdAt
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
