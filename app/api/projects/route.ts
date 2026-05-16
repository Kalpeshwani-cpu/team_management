import { getCurrentUser } from '@/lib/auth'
import { createProject, logActivity, getAllProjects, addProjectMember } from '@/lib/db'
import { canCreateProject, canViewAllProjects } from '@/lib/policies'
import { resolvePrimaryRole } from '@/lib/auth'
import { getProjectsForRole } from '@/lib/dashboard-data'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  departmentId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const role = resolvePrimaryRole(currentUser)
    const projects = (await canViewAllProjects(currentUser))
      ? await getAllProjects()
      : await getProjectsForRole(currentUser.id, role)
    return NextResponse.json(projects)
  } catch (error: any) {
    console.error('[PROJECTS_GET]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = projectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const { name, description, departmentId } = validation.data

    if (!(await canCreateProject(currentUser))) {
      return NextResponse.json(
        { error: 'You do not have permission to create projects' },
        { status: 403 }
      )
    }

    const project = await createProject(
      name,
      currentUser.id,
      description,
      departmentId
    )

    if (project?.id) {
      const ownerRole = resolvePrimaryRole(currentUser)
      const memberRole =
        ownerRole === 'team_lead'
          ? 'team_lead'
          : ownerRole === 'developer'
            ? 'developer'
            : 'project_lead'
      await addProjectMember(project.id, currentUser.id, memberRole)
    }

    // Log activity
    await logActivity(
      currentUser.id,
      'CREATE',
      'PROJECT',
      project?.id,
      { name, description, departmentId }
    )

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error('[PROJECTS_POST]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    )
  }
}
