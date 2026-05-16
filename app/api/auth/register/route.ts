import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"


export async function POST(request: Request) {
  try {
    const { email, password, requested_role } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const isDeveloper = requested_role === 'developer'
    const status = isDeveloper ? 'approved' : 'pending'

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        requestedRole: requested_role,
        approvalStatus: status,
      },
    })

    // Create a role request
    await prisma.roleRequest.create({
      data: {
        userId: user.id,
        requestedRole: requested_role,
        reasonForRequest: "Initial sign-up request",
        status: isDeveloper ? 'approved' : 'pending',
      },
    })

    // If developer, also assign the role immediately
    if (isDeveloper) {
      const role = await prisma.role.findUnique({ where: { name: 'developer' } })
      if (role) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id
          }
        })
      }
    }

    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
