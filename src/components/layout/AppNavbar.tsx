import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Zap, PanelLeftClose, PanelLeftOpen, Bell, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { signOut } from '@/features/auth/api/auth-api'

interface AppNavbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AppNavbar({ sidebarOpen, onToggleSidebar }: AppNavbarProps) {
  const { theme, setTheme } = useTheme()
  const SidebarIcon = sidebarOpen ? PanelLeftClose : PanelLeftOpen
  const { user, loading } = useAuthSession()

  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const openSignIn = () => { setAuthMode('signin'); setAuthOpen(true) }
  const openSignUp = () => { setAuthMode('signup'); setAuthOpen(true) }

  const avatarLetter = user?.user_metadata?.name
    ? (user.user_metadata.name as string)[0].toUpperCase()
    : user?.email?.[0].toUpperCase() ?? 'U'

  return (
    <>
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

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-1.5">
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

          {!loading && (
            user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => signOut()}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
                <button className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                  {avatarLetter}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={openSignIn}
                >
                  Sign In
                </Button>
                <button
                  onClick={openSignUp}
                  className="hidden items-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 sm:flex"
                >
                  Sign Up
                </button>
              </div>
            )
          )}
        </div>
      </header>

      <AuthDialog
        open={authOpen}
        defaultMode={authMode}
        onOpenChange={setAuthOpen}
      />
    </>
  )
}
