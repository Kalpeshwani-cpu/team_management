import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Check if user is already a member
    const existingMember = await prisma.projectTeamMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ message: 'Already a member' }, { status: 200 })
    }

    // Add user to project
    await prisma.projectTeamMember.create({
      data: {
        projectId,
        userId: user.id,
        role: 'developer', // Default role when joining
      },
    })

    return NextResponse.json({ success: true, message: 'Joined project successfully' })
  } catch (error) {
    console.error('Error joining project:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
