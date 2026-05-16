// Notification Service for Email Events
// This service integrates with Supabase Auth and email sending

export type NotificationEvent =
  | 'signup_pending_approval'
  | 'role_approved'
  | 'role_rejected'
  | 'role_request_received'

interface NotificationPayload {
  event: NotificationEvent
  userEmail: string
  userName?: string
  requestedRole?: string
  rejectionReason?: string
  adminEmail?: string
}

export async function sendNotification(payload: NotificationPayload) {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Notification failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

export function getNotificationTemplate(event: NotificationEvent) {
  const templates: Record<NotificationEvent, { subject: string; template: string }> = {
    signup_pending_approval: {
      subject: 'Account Verification Pending - Team Project Management System',
      template: `
        <h2>Welcome to Team Project Management System</h2>
        <p>Thank you for signing up! Your account is pending administrator approval.</p>
        <p>You will receive another email once your role has been approved.</p>
        <p>If you have any questions, please contact support.</p>
      `,
    },
    role_approved: {
      subject: 'Your Role Has Been Approved - Team Project Management System',
      template: `
        <h2>Account Approved</h2>
        <p>Congratulations! Your role has been approved by an administrator.</p>
        <p>You can now log in and access the Team Project Management System.</p>
        <p><a href="{DASHBOARD_URL}">Go to Dashboard</a></p>
      `,
    },
    role_rejected: {
      subject: 'Your Role Request Was Not Approved - Team Project Management System',
      template: `
        <h2>Role Request Review</h2>
        <p>We reviewed your role request and are unable to approve it at this time.</p>
        <p><strong>Reason:</strong> {REJECTION_REASON}</p>
        <p>Please contact support if you would like to discuss this decision or reapply with a different role.</p>
      `,
    },
    role_request_received: {
      subject: 'New Role Request - Team Project Management System',
      template: `
        <h2>New Role Request Pending Review</h2>
        <p>A new user has requested a role: {REQUESTED_ROLE}</p>
        <p><strong>User Email:</strong> {USER_EMAIL}</p>
        <p><a href="{ADMIN_URL}">Review Request</a></p>
      `,
    },
  }

  return templates[event]
}
