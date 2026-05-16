'use client'

export default function DepartmentsList({
  departments,
}: {
  departments: any[]
}) {
  return (
    <div className="grid gap-4">
      {departments.map((dept: any) => (
        <div
          key={dept.id}
          className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{dept.name}</h3>
            {dept.budget && (
              <span className="text-sm font-medium">
                Budget: ${dept.budget.toLocaleString()}
              </span>
            )}
          </div>
          {dept.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {dept.description}
            </p>
          )}
          <div className="flex justify-between items-center text-sm">
            {dept.users && (
              <span className="text-muted-foreground">
                {dept.users.length} members
              </span>
            )}
            {dept.head_id && (
              <span className="text-muted-foreground">
                Head assigned
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
