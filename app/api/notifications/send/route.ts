import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { event, userEmail, userName, requestedRole, rejectionReason } = payload

    // In production, integrate with email service like SendGrid, Resend, etc.
    // For now, we'll log the notification and store it in the database

    // Store notification in database for in-app notifications
    if (event === 'role_approved' || event === 'role_rejected') {
      // Get user by email
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true }
      })

      if (user) {
        const notificationType = event === 'role_approved' ? 'approval_granted' : 'approval_rejected'
        const message =
          event === 'role_approved'
            ? 'Your role request has been approved. You can now access the full system.'
            : `Your role request was not approved. Reason: ${rejectionReason}`

        await prisma.notification.create({
          data: {
            userId: user.id,
            title: event === 'role_approved' ? 'Role Approved' : 'Role Request Rejected',
            message,
            notificationType,
            readStatus: false,
          }
        })
      }
    }

    // Log notification event
    console.log('[NOTIFICATION]', {
      event,
      userEmail,
      requestedRole,
      timestamp: new Date().toISOString(),
    })

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const { data, error } = await resend.emails.send({
    //   from: 'noreply@tpms.example.com',
    //   to: userEmail,
    //   subject: getNotificationTemplate(event).subject,
    //   html: getNotificationTemplate(event).template,
    // })

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      event,
      userEmail,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send notification',
      },
      { status: 500 }
    )
  }
}
