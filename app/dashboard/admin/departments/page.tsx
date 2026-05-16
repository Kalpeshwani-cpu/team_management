import { requireRole } from '@/lib/require-role'
import { getDepartments } from '@/lib/db'
import DepartmentsList from '@/components/team/departments-list'
import CreateDepartmentDialog from '@/components/team/create-department-dialog'

export default async function AdminDepartmentsPage() {
  await requireRole(['admin'])
  const departments = await getDepartments()

  return (
    <div className="p-8 max-w-6xl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Departments</h1>
          <p className="text-muted-foreground">
            Organizational structure for the whole company
          </p>
        </div>
        <CreateDepartmentDialog />
      </header>
      {departments.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No departments yet.
        </p>
      ) : (
        <DepartmentsList departments={departments} />
      )}
    </div>
  )
}
