import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const latestRoleRequest = await prisma.roleRequest.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      approvalStatus: user.approvalStatus,
      requestedRole: user.requestedRole,
      latestRoleRequest
    })
  } catch (error) {
    console.error("Error fetching user status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
