import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { REQUIRE_ADMIN_APPROVAL } from "@/lib/approval-config"


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

    const roleName = requested_role || 'developer'
    const status = REQUIRE_ADMIN_APPROVAL && roleName !== 'developer' ? 'pending' : 'approved'

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        requestedRole: roleName,
        approvalStatus: status,
        ...(status === 'approved' ? { approvedAt: new Date() } : {}),
      },
    })

    await prisma.roleRequest.create({
      data: {
        userId: user.id,
        requestedRole: roleName,
        reasonForRequest: "Initial sign-up request",
        status: status === 'approved' ? 'approved' : 'pending',
        ...(status === 'approved' ? { reviewedAt: new Date() } : {}),
      },
    })

    if (status === 'approved') {
      const role = await prisma.role.findUnique({ where: { name: roleName } })
      if (role) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
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
