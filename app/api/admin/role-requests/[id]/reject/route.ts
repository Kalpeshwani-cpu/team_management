import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = currentUser.roles?.some((ur: any) => ur.role?.name === 'admin') || currentUser.requestedRole === 'admin'
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can reject role requests' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { rejection_reason } = await request.json()

    // Get the role request
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
    })

    if (!roleRequest) {
      return NextResponse.json(
        { error: 'Role request not found' },
        { status: 404 }
      )
    }

    // Use a transaction to update role request and user status
    await prisma.$transaction(async (tx) => {
      // Update role request status
      await tx.roleRequest.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectionReason: rejection_reason,
          reviewedBy: currentUser.id,
          reviewedAt: new Date(),
        },
      })

      // Update user approval status to rejected
      await tx.user.update({
        where: { id: roleRequest.userId },
        data: {
          approvalStatus: 'rejected',
          approvedBy: currentUser.id,
          approvedAt: new Date(),
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Role request rejected',
      roleRequest: {
        id,
        status: 'rejected',
        rejection_reason,
      },
    })
  } catch (error) {
    console.error("Error rejecting role request:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to reject role request',
      },
      { status: 500 }
    )
  }
}
