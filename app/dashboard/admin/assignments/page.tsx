import AssignmentsView from '@/components/dashboard/assignments-view'
import { requireRole } from '@/lib/require-role'

export default async function AdminAssignmentsPage() {
  const { user } = await requireRole(['admin'])
  return (
    <AssignmentsView
      userId={user.id}
      role="admin"
      title="Company-wide Assignments"
      description="Assign any task across all projects. Auto-assign uses workload scoring."
    />
  )
}
