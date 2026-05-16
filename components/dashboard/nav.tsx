'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  AlertCircle,
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardNav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const loading = status === "loading"
  // @ts-ignore - session.user.role will be added via authOptions
  const userRole = session?.user?.role || 'user'

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Build nav items based on user role
  const getNavItems = () => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'user', 'project_lead', 'team_lead', 'developer'] },
      { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen, roles: ['admin', 'manager', 'user', 'project_lead', 'team_lead', 'developer'] },
      { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare, roles: ['admin', 'manager', 'user', 'project_lead', 'team_lead', 'developer'] },
    ]

    const managerItems = [
      { href: '/dashboard/team', label: 'Team', icon: Users, roles: ['admin', 'manager'] },
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'manager'] },
      { href: '/dashboard/compliance', label: 'Compliance', icon: AlertCircle, roles: ['admin', 'manager'] },
    ]

    const adminItems = [
      { href: '/dashboard/admin', label: 'Admin Panel', icon: Settings, roles: ['admin'] },
    ]

    const items = [
      ...baseItems,
      ...managerItems,
      ...adminItems,
      { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'user', 'project_lead', 'team_lead', 'developer'] },
    ]

    return items.filter((item) => item.roles.includes(userRole))
  }

  const navItems = getNavItems()
  const isActive = (href: string) => pathname === href

  return (
    <>
      <button
        className="fixed top-4 left-4 p-2 lg:hidden z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav
        className={`fixed lg:static left-0 top-0 h-screen w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 mt-8 lg:mt-0">
            <h1 className="text-2xl font-bold">TPMS</h1>
            {!loading && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary capitalize">
                {userRole}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
