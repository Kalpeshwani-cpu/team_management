import { getCurrentUser, hasRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
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

    // Check if user is admin
    // In our new system, the role is part of the user object
    const isAdmin = currentUser.roles?.some((ur: any) => ur.role?.name === 'admin') || currentUser.requestedRole === 'admin'
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can view role requests' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'pending'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get role requests with user info
    const roleRequests = await prisma.roleRequest.findMany({
      where: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            approvalStatus: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const count = await prisma.roleRequest.count({ where: { status } })

    // Map fields to match the expected format in the frontend (CamelCase to snake_case if needed)
    const formattedRequests = roleRequests.map((req: any) => ({
      id: req.id,
      user_id: req.userId,
      requested_role: req.requestedRole,
      status: req.status,
      reason_for_request: req.reasonForRequest,
      rejection_reason: req.rejectionReason,
      created_at: req.createdAt,
      reviewed_at: req.reviewedAt,
      users: {
        email: req.user.email,
        first_name: req.user.firstName,
        last_name: req.user.lastName,
      }
    }))

    return NextResponse.json({
      success: true,
      roleRequests: formattedRequests,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count,
      },
    })
  } catch (error) {
    console.error("Error fetching role requests:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch role requests',
      },
      { status: 500 }
    )
  }
}
