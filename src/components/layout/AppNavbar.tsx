import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import {
  Moon,
  Sun,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Search,
  LogOut,
  Settings2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { signOut } from '@/features/auth/api/auth-api'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

interface AppNavbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  /** When false, sidebar toggle is hidden (e.g. unauthenticated layout). */
  sidebarAvailable?: boolean
}

export function AppNavbar({
  sidebarOpen,
  onToggleSidebar,
  sidebarAvailable = true,
}: AppNavbarProps) {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const SidebarIcon = sidebarOpen ? PanelLeftClose : PanelLeftOpen
  const { user, loading } = useAuthSession()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const openSignIn = () => {
    setAuthMode('signin')
    setAuthOpen(true)
  }
  const openSignUp = () => {
    setAuthMode('signup')
    setAuthOpen(true)
  }

  useEffect(() => {
    if (!userMenuOpen) return
    const onDown = (e: MouseEvent) => {
      const el = userMenuRef.current
      if (!el || el.contains(e.target as Node)) return
      setUserMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [userMenuOpen])

  const avatarLetter = user?.user_metadata?.name
    ? (user.user_metadata.name as string)[0].toUpperCase()
    : user?.email?.[0].toUpperCase() ?? 'U'

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 w-full items-center border-b border-border/60 bg-background/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          {sidebarAvailable ? (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t('common.toggleSidebar')}
            >
              <SidebarIcon className="size-4" />
            </button>
          ) : null}

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
              placeholder={t('common.searchTasksBoards')}
              className="h-8 w-full rounded-lg border border-border bg-muted/40 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher className="flex sm:hidden" />
          <LanguageSwitcher className="hidden sm:flex" />

          <button
            type="button"
            className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-indigo-500" />
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {!loading && (
            user ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title={t('common.signOut')}
                  aria-label={t('common.signOut')}
                >
                  <LogOut className="size-4" />
                </button>
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    aria-label={t('layout.userMenuAria')}
                  >
                    {avatarLetter}
                  </button>
                  {userMenuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+0.375rem)] z-[60] min-w-[12.5rem] rounded-xl border border-border/60 bg-card py-1 shadow-md"
                    >
                      <Link
                        to="/settings#saas-telegram"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Settings2 className="size-4 shrink-0 text-muted-foreground" />
                        {t('layout.userSettings')}
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={openSignIn}
                >
                  {t('common.signIn')}
                </Button>
                <button
                  type="button"
                  onClick={openSignUp}
                  className="hidden items-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 sm:flex"
                >
                  {t('common.signUp')}
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
