import { Outlet } from 'react-router-dom'
import { useUIStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          'flex w-64 flex-col border-r border-border bg-card transition-all duration-300',
          !sidebarOpen && 'w-0 overflow-hidden',
        )}
      >
        <div className="p-6">
          <span className="text-lg font-semibold tracking-tight text-primary">
            AI Task Board
          </span>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
