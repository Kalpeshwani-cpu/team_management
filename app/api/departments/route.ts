import { getCurrentUser, hasRole } from '@/lib/auth'
import { getDepartments, createDepartment } from '@/lib/db'
import { logActivity } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const departments = await getDepartments()
    return NextResponse.json(departments)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch departments' },
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

    // Check if user has manager or admin role
    const isManager = await hasRole(currentUser.id, 'manager')
    const isAdmin = await hasRole(currentUser.id, 'admin')

    if (!isManager && !isAdmin) {
      return NextResponse.json(
        { error: 'Only managers and admins can create departments' },
        { status: 403 }
      )
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      )
    }

    const department = await createDepartment(name, description)

    // Log activity
    await logActivity(
      currentUser.id,
      'CREATE',
      'DEPARTMENT',
      department?.id,
      { name, description }
    )

    return NextResponse.json(department, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create department' },
      { status: 500 }
    )
  }
}
