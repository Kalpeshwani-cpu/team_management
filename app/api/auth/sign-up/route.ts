import { signUp } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const data = await signUp(email, password, firstName, lastName)

    return NextResponse.json(
      {
        message: 'Sign up successful. Your account is pending admin approval.',
        user: data.user,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Sign up failed' },
      { status: 400 }
    )
  }
}
