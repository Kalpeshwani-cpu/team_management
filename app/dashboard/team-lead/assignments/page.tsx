import AssignmentsView from '@/components/dashboard/assignments-view'
import { requireRole } from '@/lib/require-role'

export default async function TeamLeadAssignmentsPage() {
  const { user } = await requireRole(['team_lead', 'project_lead', 'admin', 'manager'])
  return (
    <AssignmentsView
      userId={user.id}
      role="team_lead"
      title="Team Task Assignment"
      description="Distribute tasks across developers on your projects."
    />
  )
}
