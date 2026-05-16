'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProjectsList({ projects }: { projects: any[] }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // @ts-ignore
  const userRole = session?.user?.role || 'user'
  const userId = session?.user?.id

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'in_progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleJoinProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setLoadingId(projectId)

    try {
      const response = await fetch(`/api/projects/${projectId}/join`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error joining project:', error)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="grid gap-4">
      {projects.map((project: any) => {
        const isMember = project.teamMembers?.some((m: any) => m.userId === userId) || project.ownerId === userId
        const canJoin = userRole === 'developer' && !isMember

        return (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <div className="p-6 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  {project.department && (
                    <p className="text-sm text-muted-foreground">
                      {project.department.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {canJoin && (
                    <Button
                      size="sm"
                      onClick={(e) => handleJoinProject(e, project.id)}
                      disabled={loadingId === project.id}
                    >
                      {loadingId === project.id ? 'Joining...' : 'Accept Project'}
                    </Button>
                  )}
                  <Badge className={getStatusColor(project.status || 'planning')}>
                    {(project.status || 'planning').replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description}
                </p>
              )}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{project.teamMembers?.length || 0} team members</span>
                {project.endDate && (
                  <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
