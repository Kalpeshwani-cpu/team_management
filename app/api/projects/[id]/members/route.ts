import { getCurrentUser } from '@/lib/auth'
import { addProjectMember, logActivity } from '@/lib/db'
import { canAssignTeamMember, getAssignableUsers } from '@/lib/policies'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const postSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['developer', 'team_lead', 'project_lead']).default('developer'),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allowed = await canAssignTeamMember(currentUser, projectId)
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await getAssignableUsers(projectId)
    const members = await prisma.projectTeamMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    return NextResponse.json({ members, candidates: users })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allowed = await canAssignTeamMember(currentUser, projectId)
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const member = await addProjectMember(
      projectId,
      parsed.data.userId,
      parsed.data.role
    )

    await logActivity(currentUser.id, 'ADD_MEMBER', 'PROJECT', projectId, parsed.data)

    return NextResponse.json(member, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allowed = await canAssignTeamMember(currentUser, projectId)
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    await prisma.projectTeamMember.delete({
      where: { projectId_userId: { projectId, userId } },
    })

    await logActivity(currentUser.id, 'REMOVE_MEMBER', 'PROJECT', projectId, { userId })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}
