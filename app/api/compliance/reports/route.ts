import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = request.nextUrl.searchParams.get('projectId')
    const complianceType = request.nextUrl.searchParams.get('complianceType')

    const whereClause: any = {}
    if (projectId) whereClause.projectId = projectId
    if (complianceType) whereClause.complianceType = complianceType

    const data = await prisma.complianceReport.findMany({
      where: whereClause,
      include: {
        project: {
          select: { name: true }
        },
        reviewer: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: {
        generatedAt: 'desc'
      }
    })

    // Map to the expected format
    const formattedData = data.map(report => ({
      id: report.id,
      project_id: report.projectId,
      compliance_type: report.complianceType,
      status: report.status,
      score: report.score,
      findings: report.findings,
      recommendations: report.recommendations,
      reviewed_by_id: report.reviewedBy,
      reviewed_at: report.reviewedAt,
      generated_at: report.generatedAt,
      projects: { name: report.project.name },
      reviewed_by: report.reviewer ? {
        first_name: report.reviewer.firstName,
        last_name: report.reviewer.lastName
      } : null
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching compliance reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, complianceType } = await request.json()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!projectId || !complianceType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify project exists and user owns it
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Calculate compliance score based on type
    let score = 0
    let status = 'pass'
    let findings = ''
    let recommendations = ''

    if (complianceType === 'deadline_adherence') {
      // Calculate deadline adherence
      const tasks = await prisma.task.findMany({
        where: { projectId: projectId },
        select: { status: true, dueDate: true, updatedAt: true }
      })

      if (tasks && tasks.length > 0) {
        const onTimeTasks = tasks.filter((t: any) => {
          if (t.status !== 'completed' || !t.dueDate) return false
          return new Date(t.updatedAt) <= new Date(t.dueDate)
        }).length

        score = (onTimeTasks / tasks.length) * 100
        status = score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail'

        if (score < 80) {
          findings = `${Math.round(100 - score)}% of tasks were completed late`
          recommendations = 'Consider improving deadline management and task prioritization'
        }
      }
    } else if (complianceType === 'resource_utilization') {
      // Calculate resource utilization
      const members = await prisma.projectTeamMember.findMany({
        where: { projectId: projectId },
        select: { userId: true }
      })

      const tasks = await prisma.task.findMany({
        where: { projectId: projectId },
        select: { assignedTo: true }
      })

      if (members.length > 0) {
        const utilizedMembers = new Set(tasks.map((t: any) => t.assignedTo).filter(Boolean)).size
        score = (utilizedMembers / members.length) * 100
        status = score >= 70 ? 'pass' : 'warning'

        if (score < 70) {
          findings = `Only ${utilizedMembers}/${members.length} team members are actively assigned`
          recommendations = 'Better distribute tasks among team members'
        }
      }
    } else if (complianceType === 'quality_assurance') {
      // Quality based on tasks in review vs completed
      const tasks = await prisma.task.findMany({
        where: { projectId: projectId },
        select: { status: true }
      })

      if (tasks && tasks.length > 0) {
        const reviewTasks = tasks.filter((t: any) => t.status === 'review').length
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length

        score = completedTasks > 0 ? ((completedTasks - reviewTasks) / completedTasks) * 100 : 50
        status = score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail'

        if (score < 85) {
          findings = `${reviewTasks} tasks pending review - potential quality concerns`
          recommendations = 'Implement stricter QA processes before task completion'
        }
      }
    }

    const report = await prisma.complianceReport.create({
      data: {
        projectId: projectId,
        complianceType: complianceType,
        score: Math.round(score),
        status,
        findings,
        recommendations,
      }
    })

    const responseData = {
      id: report.id,
      project_id: report.projectId,
      compliance_type: report.complianceType,
      score: report.score,
      status: report.status,
      findings: report.findings,
      recommendations: report.recommendations,
      generated_at: report.generatedAt
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Error creating compliance report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
