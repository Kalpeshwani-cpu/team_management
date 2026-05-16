import { getCurrentUser, hasRole, hasPermission } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export type RBACConfig = {
  requiredRoles?: string[]
  requiredPermissions?: string[]
  requireAuth?: boolean
}

export async function checkRBAC(
  request: NextRequest,
  config: RBACConfig
) {
  const { requiredRoles, requiredPermissions, requireAuth = true } = config

  const currentUser = await getCurrentUser()

  if (!currentUser && requireAuth) {
    return {
      allowed: false,
      error: 'Unauthorized',
      status: 401,
    }
  }

  if (!currentUser) {
    return {
      allowed: true,
      user: null,
    }
  }

  // Check role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    let hasRequiredRole = false
    for (const role of requiredRoles) {
      if (await hasRole(currentUser.id, role)) {
        hasRequiredRole = true
        break
      }
    }

    if (!hasRequiredRole) {
      return {
        allowed: false,
        error: 'Insufficient permissions - Required roles: ' + requiredRoles.join(', '),
        status: 403,
      }
    }
  }

  // Check permission requirements
  if (requiredPermissions && requiredPermissions.length > 0) {
    let hasRequiredPermission = false
    for (const permission of requiredPermissions) {
      if (await hasPermission(currentUser.id, permission)) {
        hasRequiredPermission = true
        break
      }
    }

    if (!hasRequiredPermission) {
      return {
        allowed: false,
        error: 'Insufficient permissions - Required permissions: ' + requiredPermissions.join(', '),
        status: 403,
      }
    }
  }

  return {
    allowed: true,
    user: currentUser,
  }
}

export function createRBACRoute(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  config: RBACConfig = {}
) {
  return async (request: NextRequest) => {
    const rbacCheck = await checkRBAC(request, config)

    if (!rbacCheck.allowed) {
      return NextResponse.json(
        { error: rbacCheck.error },
        { status: rbacCheck.status }
      )
    }

    return handler(request, rbacCheck.user)
  }
}
