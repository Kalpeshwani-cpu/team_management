import 'next-auth'
import type { SystemRole } from '@/lib/roles'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      roles?: string[]
      primaryRole?: SystemRole
      role?: SystemRole
      approvalStatus?: string
    }
  }

  interface User {
    id: string
    approvalStatus?: string
    roles?: string[]
    primaryRole?: SystemRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    approvalStatus?: string
    roles?: string[]
    primaryRole?: SystemRole
  }
}
