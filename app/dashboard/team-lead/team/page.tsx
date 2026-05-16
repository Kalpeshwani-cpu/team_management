import { requireRole, getDisplayName } from '@/lib/require-role'
import { getTeamLeadProjects } from '@/lib/db'

export default async function TeamLeadTeamPage() {
  const { user } = await requireRole(['team_lead', 'project_lead', 'admin', 'manager'])
  const projects = await getTeamLeadProjects(user.id)

  const members = new Map<
    string,
    { name: string; email: string; projects: string[] }
  >()

  for (const p of projects) {
    for (const m of p.teamMembers ?? []) {
      const u = m.user
      const key = u.id
      const name =
        [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'User'
      const existing = members.get(key)
      if (existing) {
        existing.projects.push(p.name)
      } else {
        members.set(key, {
          name,
          email: u.email ?? '',
          projects: [p.name],
        })
      }
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">My Team</h1>
      <p className="text-muted-foreground mb-8">
        Team members across projects you lead, {getDisplayName(user)}.
      </p>
      <ul className="space-y-3">
        {Array.from(members.values()).map((m) => (
          <li key={m.email} className="p-4 border border-border rounded-lg">
            <p className="font-semibold">{m.name}</p>
            <p className="text-sm text-muted-foreground">{m.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Projects: {m.projects.join(', ')}
            </p>
          </li>
        ))}
        {members.size === 0 && (
          <p className="text-muted-foreground">No team members on your projects yet.</p>
        )}
      </ul>
    </div>
  )
}
