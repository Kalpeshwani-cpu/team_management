import { requireRole } from '@/lib/require-role'
import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS, type SystemRole } from '@/lib/roles'

export default async function AdminUsersPage() {
  await requireRole(['admin'])

  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      roles: { include: { role: true } },
      department: { select: { name: true } },
    },
    orderBy: { email: 'asc' },
  })

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">User Management</h1>
      <p className="text-muted-foreground mb-8">
        All active users across the company ({users.length})
      </p>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Department</th>
              <th className="text-left p-3 font-medium">Roles</th>
              <th className="text-left p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3">
                  {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.department?.name ?? '—'}</td>
                <td className="p-3 flex flex-wrap gap-1">
                  {u.roles.length > 0 ? (
                    u.roles.map((ur) => (
                      <Badge key={ur.id} variant="secondary">
                        {ROLE_LABELS[ur.role.name as SystemRole] ?? ur.role.name}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">{u.requestedRole ?? 'pending'}</Badge>
                  )}
                </td>
                <td className="p-3 capitalize">{u.approvalStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
