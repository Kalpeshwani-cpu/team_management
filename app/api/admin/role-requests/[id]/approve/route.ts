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
        { error: 'Only admins can approve role requests' },
        { status: 403 }
      )
    }

    const { id } = await params

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

    // Use a transaction to update role request, assign role, and update user status
    await prisma.$transaction(async (tx) => {
      // Update role request status
      await tx.roleRequest.update({
        where: { id },
        data: {
          status: 'approved',
          reviewedBy: currentUser.id,
          reviewedAt: new Date(),
        },
      })

      // Get the role by name
      const role = await tx.role.findUnique({
        where: { name: roleRequest.requestedRole },
      })

      if (role) {
        // Assign role to user if not already assigned
        await tx.userRole.upsert({
          where: {
            userId_roleId: {
              userId: roleRequest.userId,
              roleId: role.id,
            },
          },
          update: {},
          create: {
            userId: roleRequest.userId,
            roleId: role.id,
          },
        })
      }

      // Update user approval status
      await tx.user.update({
        where: { id: roleRequest.userId },
        data: {
          approvalStatus: 'approved',
          approvedBy: currentUser.id,
          approvedAt: new Date(),
          requestedRole: roleRequest.requestedRole,
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Role request approved',
      roleRequest: {
        id,
        status: 'approved',
        requested_role: roleRequest.requestedRole,
      },
    })
  } catch (error) {
    console.error("Error approving role request:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to approve role request',
      },
      { status: 500 }
    )
  }
}
