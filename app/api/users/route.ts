import { getCurrentUser } from '@/lib/auth'
import { getUsersByDepartment, updateUser } from '@/lib/db'
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

    const departmentId = request.nextUrl.searchParams.get('departmentId')

    if (departmentId) {
      const users = await getUsersByDepartment(departmentId)
      return NextResponse.json(users)
    }

    return NextResponse.json(
      { error: 'departmentId parameter is required' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, first_name, last_name, firstName, lastName, ...rest } = body

    if (userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const updates: Record<string, unknown> = { ...rest }
    if (firstName !== undefined || first_name !== undefined) {
      updates.firstName = firstName ?? first_name
    }
    if (lastName !== undefined || last_name !== undefined) {
      updates.lastName = lastName ?? last_name
    }
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const fn = String(updates.firstName ?? currentUser.firstName ?? '')
      const ln = String(updates.lastName ?? currentUser.lastName ?? '')
      updates.name = [fn, ln].filter(Boolean).join(' ') || null
    }

    const updatedUser = await updateUser(userId, updates)

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}
