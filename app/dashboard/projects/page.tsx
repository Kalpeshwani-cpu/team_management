import { getCurrentUser } from '@/lib/auth'
import { getProjects } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProjectsList from '@/components/projects/list'
import CreateProjectDialog from '@/components/projects/create-dialog'

export default async function ProjectsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <div className="p-8">Loading...</div>
  }

  const isDeveloper = currentUser.roles?.some((ur: any) => ur.role?.name === 'developer') || currentUser.requestedRole === 'developer'
  const projects = isDeveloper ? await getProjects() : await getProjects(currentUser.id)

  return (
    <div className="p-8">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">
              Create and manage your projects
            </p>
          </div>
          <CreateProjectDialog userId={currentUser.id} />
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No projects yet. Create one to get started!
            </p>
          </div>
        ) : (
          <ProjectsList projects={projects} />
        )}
      </div>
    </div>
  )
}
