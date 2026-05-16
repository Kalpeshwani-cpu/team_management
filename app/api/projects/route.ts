import { getCurrentUser } from '@/lib/auth'
import { getProjects, createProject, logActivity } from '@/lib/db'
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

    const projects = await getProjects(currentUser.id)
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

    const project = await createProject(
      name,
      currentUser.id,
      description,
      departmentId
    )

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
