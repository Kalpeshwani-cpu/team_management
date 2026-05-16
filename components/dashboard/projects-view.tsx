import ProjectsList from '@/components/projects/list'
import CreateProjectDialog from '@/components/projects/create-dialog'
import { getProjectsForRole } from '@/lib/dashboard-data'
import type { SystemRole } from '@/lib/roles'

export default async function ProjectsView({
  userId,
  role,
  canCreate = true,
}: {
  userId: string
  role: SystemRole
  canCreate?: boolean
}) {
  const projects = await getProjectsForRole(userId, role)

  return (
    <div className="p-8 max-w-6xl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            {role === 'developer'
              ? 'Projects you belong to — join open projects to collaborate'
              : 'Create and manage projects for your organization'}
          </p>
        </div>
        {canCreate && <CreateProjectDialog userId={userId} />}
      </header>
      {projects.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No projects yet. Create one to get started.
        </p>
      ) : (
        <ProjectsList projects={projects} />
      )}
    </div>
  )
}
