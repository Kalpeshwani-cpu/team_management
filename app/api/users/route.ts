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

    const { userId, ...updates } = await request.json()

    // Users can only update their own profile
    if (userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
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
