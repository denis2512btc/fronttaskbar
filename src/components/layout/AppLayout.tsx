import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, KanbanSquare, Settings } from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'
import { AppNavbar } from './AppNavbar'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Доски', href: '/' },
  { icon: KanbanSquare, label: 'Канбан', href: '/board/demo' },
  { icon: Settings, label: 'Настройки', href: '/settings' },
]

export function AppLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNavbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'flex shrink-0 flex-col border-r border-border/60 bg-card transition-all duration-300 ease-in-out',
            sidebarOpen ? 'w-56' : 'w-0 overflow-hidden',
          )}
        >
          <nav className="flex flex-col gap-0.5 p-2 pt-3">
            {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex flex-1 flex-col overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
