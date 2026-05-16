'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
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
  UserCog,
  ClipboardList,
  Building2,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import {
  ROLE_LABELS,
  ROLE_SLUG,
  type SystemRole,
} from '@/lib/roles'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
}

function itemsForRole(role: SystemRole): NavItem[] {
  const slug = ROLE_SLUG[role]
  const base = `/dashboard/${slug}`

  const shared: NavItem[] = [
    { href: base, label: 'Overview', icon: LayoutDashboard },
    { href: `${base}/settings`, label: 'Settings', icon: Settings },
  ]

  switch (role) {
    case 'admin':
      return [
        { href: base, label: 'Overview', icon: LayoutDashboard },
        { href: `${base}/users`, label: 'Users', icon: Users },
        { href: `${base}/role-approvals`, label: 'Role Approvals', icon: Shield },
        { href: `${base}/projects`, label: 'All Projects', icon: FolderOpen },
        { href: `${base}/assignments`, label: 'Assignments', icon: ClipboardList },
        { href: `${base}/departments`, label: 'Departments', icon: Building2 },
        { href: `${base}/analytics`, label: 'Analytics', icon: BarChart3 },
        { href: `${base}/compliance`, label: 'Compliance', icon: AlertCircle },
        { href: `${base}/settings`, label: 'Settings', icon: Settings },
      ]
    case 'manager':
      return [
        { href: base, label: 'Overview', icon: LayoutDashboard },
        { href: `${base}/team`, label: 'Team', icon: Users },
        { href: `${base}/projects`, label: 'Projects', icon: FolderOpen },
        { href: `${base}/assignments`, label: 'Assignments', icon: ClipboardList },
        { href: `${base}/analytics`, label: 'Analytics', icon: BarChart3 },
        { href: `${base}/compliance`, label: 'Compliance', icon: AlertCircle },
        ...shared.slice(1),
      ]
    case 'project_lead':
      return [
        { href: base, label: 'Overview', icon: LayoutDashboard },
        { href: `${base}/projects`, label: 'My Projects', icon: FolderOpen },
        { href: `${base}/assignments`, label: 'Assign Work', icon: ClipboardList },
        { href: `${base}/tasks`, label: 'Tasks', icon: CheckSquare },
        ...shared.slice(1),
      ]
    case 'team_lead':
      return [
        { href: base, label: 'Overview', icon: LayoutDashboard },
        { href: `${base}/team`, label: 'My Team', icon: Users },
        { href: `${base}/assignments`, label: 'Assign Tasks', icon: ClipboardList },
        { href: `${base}/tasks`, label: 'Tasks', icon: CheckSquare },
        ...shared.slice(1),
      ]
    case 'developer':
    default:
      return [
        { href: base, label: 'Overview', icon: LayoutDashboard },
        { href: `${base}/projects`, label: 'Projects', icon: FolderOpen },
        { href: `${base}/tasks`, label: 'My Tasks', icon: CheckSquare },
        ...shared.slice(1),
      ]
  }
}

export default function RoleNav({ primaryRole }: { primaryRole: SystemRole }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const navItems = itemsForRole(primaryRole)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isActive = (href: string) =>
    pathname === href || (href !== navItems[0]?.href && pathname.startsWith(href + '/'))

  return (
    <>
      <button
        type="button"
        className="fixed top-4 left-4 p-2 lg:hidden z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
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
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary">
              {ROLE_LABELS[primaryRole]}
            </span>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    type="button"
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
          role="presentation"
        />
      )}
    </>
  )
}
