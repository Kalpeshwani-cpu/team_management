import AssignmentsView from '@/components/dashboard/assignments-view'
import { requireManagerOrAdmin } from '@/lib/require-role'

export default async function ManagerAssignmentsPage() {
  const { user } = await requireManagerOrAdmin()
  return (
    <AssignmentsView
      userId={user.id}
      role="manager"
      title="Department Assignments"
    />
  )
}
