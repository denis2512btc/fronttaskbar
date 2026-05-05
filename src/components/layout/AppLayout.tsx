import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Plus, Settings } from 'lucide-react'
import { BoardsSidebarList } from '@/features/boards/components/BoardsSidebarList'
import { CreateBoardDialog } from '@/features/boards/components/CreateBoardDialog'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useUIStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'
import { AppNavbar } from './AppNavbar'

export function AppLayout() {
  const { t } = useTranslation()
  const { sidebarOpen, toggleSidebar, openCreateBoardDialog } = useUIStore()
  const { pathname } = useLocation()
  const { user } = useAuthSession()
  const overviewActive = pathname === '/'
  const sidebarAvailable = Boolean(user)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNavbar
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarAvailable={sidebarAvailable}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarAvailable ? (
          <aside
            className={cn(
              'flex shrink-0 flex-col border-r border-border/60 bg-card transition-all duration-300 ease-in-out',
              sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
            )}
          >
            <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2 pt-3">
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  overviewActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <LayoutDashboard className="size-4 shrink-0" />
                {t('layout.overview')}
              </Link>

              <div className="px-3 pt-2">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('layout.boardsSection')}
                </p>
                <BoardsSidebarList />
              </div>

              <button
                type="button"
                onClick={openCreateBoardDialog}
                className="mx-1 mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-4 shrink-0" />
                {t('layout.newBoard')}
              </button>

              <div className="flex-1" />

              <Link
                to="/settings"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === '/settings'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Settings className="size-4 shrink-0" />
                {t('layout.settings')}
              </Link>
            </nav>
          </aside>
        ) : null}

        <main className="flex flex-1 flex-col overflow-auto">
          <Outlet />
        </main>
      </div>

      {sidebarAvailable ? <CreateBoardDialog /> : null}
    </div>
  )
}
