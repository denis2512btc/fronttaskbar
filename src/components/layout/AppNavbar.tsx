import { useTheme } from 'next-themes'
import { Moon, Sun, Zap, PanelLeftClose, PanelLeftOpen, Bell, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AppNavbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AppNavbar({ sidebarOpen, onToggleSidebar }: AppNavbarProps) {
  const { theme, setTheme } = useTheme()
  const SidebarIcon = sidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center border-b border-border/60 bg-background/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <SidebarIcon className="size-4" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Zap className="size-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight sm:block">
            <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            <span>TaskBoard</span>
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="mx-4 flex flex-1 items-center">
        <div className="relative hidden max-w-sm flex-1 sm:flex">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск задач, досок..."
            className="h-8 w-full rounded-lg border border-border bg-muted/40 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        <button className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-indigo-500" />
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        {/* Avatar */}
        <button className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
          D
        </button>
      </div>
    </header>
  )
}
