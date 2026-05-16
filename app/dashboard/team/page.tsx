import { getCurrentUser } from '@/lib/auth'
import { getDepartments } from '@/lib/db'
import DepartmentsList from '@/components/team/departments-list'
import CreateDepartmentDialog from '@/components/team/create-department-dialog'

export default async function TeamPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <div className="p-8">Loading...</div>
  }

  const departments = await getDepartments()

  return (
    <div className="p-8">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-muted-foreground">
              Manage departments and team members
            </p>
          </div>
          <CreateDepartmentDialog />
        </div>

        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No departments yet. Create one to organize your team!
            </p>
          </div>
        ) : (
          <DepartmentsList departments={departments} />
        )}
      </div>
    </div>
  )
}
