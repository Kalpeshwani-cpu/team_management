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

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const entityType = request.nextUrl.searchParams.get('entityType')

    const whereClause: any = {
      userId: session.user.id
    }

    if (entityType) {
      whereClause.entityType = entityType
    }

    const data = await prisma.monitoringLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Map Prisma format to the expected response format
    const formattedData = data.map(log => {
      // Safely handle details parsing if it's a JSON string or object
      let parsedDetails: any = typeof log.details === 'string' ? JSON.parse(log.details) : (log.details || {})
      
      return {
        id: log.id,
        user_id: log.userId,
        action: log.action,
        entity_type: log.entityType,
        entity_id: log.entityId,
        entity_name: parsedDetails?.entityName || '',
        details: parsedDetails,
        created_at: log.createdAt,
        users: log.user ? {
          id: log.user.id,
          first_name: log.user.name?.split(' ')[0] || '',
          last_name: log.user.name?.split(' ').slice(1).join(' ') || '',
          email: log.user.email
        } : null
      }
    })

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching activity feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, entityType, entityId, entityName, details } = await request.json()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!action || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Include entityName in details json since it's not a standalone column in MonitoringLog
    const combinedDetails = {
      ...(details || {}),
      entityName
    }

    const log = await prisma.monitoringLog.create({
      data: {
        userId: session.user.id,
        action,
        entityType,
        entityId,
        details: combinedDetails,
      }
    })

    const responseData = {
      id: log.id,
      user_id: log.userId,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      entity_name: entityName,
      details: combinedDetails,
      created_at: log.createdAt,
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Error creating activity feed entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
