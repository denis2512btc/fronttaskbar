import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { Moon, Sun, Zap, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'О нас', href: '#about' },
  { label: 'Возможности', href: '#features' },
  { label: 'Как это работает', href: '#how' },
  { label: 'Превью', href: '#preview' },
  { label: 'Тарифы', href: '#pricing' },
  { label: 'Контакты', href: '#contacts' },
]

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [lang, setLang] = useState<'RU' | 'EN'>('RU')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const openSignIn = () => { setAuthMode('signin'); setAuthOpen(true) }
  const openSignUp = () => { setAuthMode('signup'); setAuthOpen(true) }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Zap className="size-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              <span>TaskBoard</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-5 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="hidden items-center rounded-lg border border-border bg-muted/40 p-0.5 sm:flex">
              {(['RU', 'EN'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    lang === l
                      ? 'bg-white text-foreground shadow-sm dark:bg-neutral-800'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={openSignIn}
            >
              Sign In
            </Button>

            <button
              onClick={openSignUp}
              className="hidden items-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 sm:flex"
            >
              Sign Up
            </button>

            {/* Mobile hamburger */}
            <button
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border/40 bg-background px-4 pb-4 md:hidden">
            <nav className="mt-3 flex flex-col gap-3">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setMobileOpen(false); openSignIn() }}
              >
                Sign In
              </Button>
              <button
                onClick={() => { setMobileOpen(false); openSignUp() }}
                className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-1.5 text-sm font-medium text-white"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      <AuthDialog
        open={authOpen}
        defaultMode={authMode}
        onOpenChange={setAuthOpen}
      />
    </>
  )
}
