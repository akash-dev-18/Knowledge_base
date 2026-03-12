'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Brain,
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/workspaces', label: 'Workspaces', icon: FolderOpen },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, company, logout } = useAuthStore()

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 border border-primary/25">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-tight">
            KnowledgeBase AI
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[130px]">
            {company?.name ?? 'Your Company'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" aria-label="Main navigation">
        <ul className="flex flex-col gap-0.5">
          {navItems
            .filter((item) => {
              if (item.label === 'Settings' && user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
                return false
              }
              if (item.label === 'Team' && user?.role === 'VIEWER') {
                // Viewers shouldn't need to see the team page either
                return false
              }
              return true
            })
            .map(({ href, label, icon: Icon }) => {
              const isActive =
                href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-sidebar-accent text-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                      )}
                    />
                    {label}
                    {isActive && (
                      <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground" />
                    )}
                  </Link>
                </li>
              )
            })}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent mb-2">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-xs font-medium text-foreground truncate leading-tight">
              {user?.fullName ?? 'User'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email ?? ''}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
