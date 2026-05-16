'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { AlertCircle, Clock } from 'lucide-react'

type RoleRequest = {
  id: string
  requestedRole: string
  status: string
  createdAt: string
  rejectionReason?: string
}

export default function PendingApprovalPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [roleRequest, setRoleRequest] = useState<RoleRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      if (sessionStatus !== 'authenticated') return

      try {
        // Fetch user status and role request from our new API
        const response = await fetch('/api/user/status')
        const data = await response.json()

        if (data.approvalStatus === 'approved') {
          router.push('/dashboard')
          return
        }

        setRoleRequest(data.latestRoleRequest)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sessionStatus, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <CardTitle>Approval Pending</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Hello <span className="font-semibold">{session?.user?.email}</span>,
            </p>
            <p className="text-sm">
              Thank you for signing up! Your account is awaiting administrator approval.
            </p>
          </div>

          {roleRequest && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Requested Role</p>
              <p className="text-sm">
                <span className="inline-block px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold">
                  {roleRequest.requestedRole.replace(/_/g, ' ').toUpperCase()}
                </span>
              </p>

              {roleRequest.status === 'rejected' && roleRequest.rejectionReason && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-medium text-red-600">Rejection Reason</p>
                  <p className="text-sm text-red-500 mt-2">{roleRequest.rejectionReason}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Please contact support to reapply with a different role.
                  </p>
                </div>
              )}

              {roleRequest.status === 'pending' && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Requested on:{' '}
                    {new Date(roleRequest.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs text-blue-900">
                      An administrator will review your request shortly. Please check back later to see your approval status in the app.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
            {(!roleRequest || roleRequest.status === 'pending') && (
              <p className="text-xs text-center text-muted-foreground">
                You can log back in once your role has been approved.
              </p>
            )}

            {roleRequest?.status === 'approved' && (
              <Button
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
