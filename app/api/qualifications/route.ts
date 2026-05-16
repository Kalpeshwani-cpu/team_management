import { getCurrentUser } from '@/lib/auth'
import { getQualifications, createQualification, logActivity } from '@/lib/db'
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

    const qualifications = await getQualifications()
    return NextResponse.json(qualifications)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch qualifications' },
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

    const { name, description, level } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Qualification name is required' },
        { status: 400 }
      )
    }

    const qualification = await createQualification(name, description, level)

    // Log activity
    await logActivity(
      currentUser.id,
      'CREATE',
      'QUALIFICATION',
      qualification?.id,
      { name, description, level }
    )

    return NextResponse.json(qualification, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create qualification' },
      { status: 500 }
    )
  }
}
