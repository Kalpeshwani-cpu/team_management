import { getCurrentUser, hasRole } from '@/lib/auth'
import { getActivityLogs } from '@/lib/db'
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

    // Only admins can view activity logs
    const isAdmin = await hasRole(currentUser.id, 'admin')

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const limit = request.nextUrl.searchParams.get('limit')
      ? parseInt(request.nextUrl.searchParams.get('limit')!)
      : 100

    const logs = await getActivityLogs(limit)
    return NextResponse.json(logs)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
