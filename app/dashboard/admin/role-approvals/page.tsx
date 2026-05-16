'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

type RoleRequest = {
  id: string
  user_id: string
  requested_role: string
  status: string
  reason_for_request: string
  rejection_reason?: string
  created_at: string
  reviewed_at?: string
  users: {
    email: string
    first_name?: string
    last_name?: string
  }
}

export default function RoleApprovalsPage() {
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)


  useEffect(() => {
    fetchRoleRequests()
  }, [filter])

  const fetchRoleRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/role-requests?status=${filter}&limit=50`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch role requests')

      const data = await response.json()
      setRoleRequests(data.roleRequests || [])
    } catch (error) {
      console.error('Error fetching role requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/admin/role-requests/${requestId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to approve role request')

      setRoleRequests(
        roleRequests.map((req) =>
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      )
    } catch (error) {
      console.error('Error approving role request:', error)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/admin/role-requests/${requestId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rejection_reason: rejectionReason,
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to reject role request')

      setRoleRequests(
        roleRequests.map((req) =>
          req.id === requestId ? { ...req, status: 'rejected' } : req
        )
      )
      setSelectedRequest(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting role request:', error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      project_lead: 'bg-purple-100 text-purple-800',
      team_lead: 'bg-green-100 text-green-800',
      developer: 'bg-gray-100 text-gray-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Approval Requests</h1>
        <p className="text-muted-foreground">Review and approve user role requests</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : roleRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No {filter} role requests found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {roleRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="font-semibold">
                      {request.users.first_name} {request.users.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{request.users.email}</p>
                  </div>
                </div>
                <Badge className={getRoleBadgeColor(request.requested_role)}>
                  {request.requested_role}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Request Reason</p>
                  <p className="text-sm text-muted-foreground">
                    {request.reason_for_request}
                  </p>
                </div>

                {request.rejection_reason && (
                  <div>
                    <p className="text-sm font-medium">Rejection Reason</p>
                    <p className="text-sm text-red-600">{request.rejection_reason}</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Requested on: {new Date(request.created_at).toLocaleDateString()}
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => setSelectedRequest(request.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {selectedRequest === request.id && (
                  <div className="space-y-2 border-t pt-4 mt-4">
                    <label className="text-sm font-medium">Rejection Reason</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection..."
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReject(request.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        Confirm Rejection
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedRequest(null)
                          setRejectionReason('')
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
