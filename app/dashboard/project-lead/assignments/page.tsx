import AssignmentsView from '@/components/dashboard/assignments-view'
import { requireRole } from '@/lib/require-role'

export default async function ProjectLeadAssignmentsPage() {
  const { user } = await requireRole(['project_lead', 'admin', 'manager'])
  return (
    <AssignmentsView
      userId={user.id}
      role="project_lead"
      title="Project Task Assignment"
      description="Assign work on projects you own. Add team members from the project page first."
    />
  )
}
