import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { Moon, Sun, Zap, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

const NAV_KEYS = [
  { labelKey: 'nav.about', href: '#about' },
  { labelKey: 'nav.features', href: '#features' },
  { labelKey: 'nav.how', href: '#how' },
  { labelKey: 'nav.preview', href: '#preview' },
  { labelKey: 'nav.pricing', href: '#pricing' },
  { labelKey: 'nav.contacts', href: '#contacts' },
] as const

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const navLinks = useMemo(
    () => NAV_KEYS.map((l) => ({ ...l, label: t(l.labelKey) })),
    [t],
  )
  const [mobileOpen, setMobileOpen] = useState(false)
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
            {navLinks.map((l) => (
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
            <LanguageSwitcher className="hidden sm:flex" />

            {/* Theme toggle */}
            <button
              type="button"
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
              {t('common.signIn')}
            </Button>

            <button
              type="button"
              onClick={openSignUp}
              className="hidden items-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 sm:flex"
            >
              {t('common.signUp')}
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
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
              {navLinks.map((l) => (
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
            <div className="mt-4">
              <LanguageSwitcher className="w-fit" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setMobileOpen(false)
                  openSignIn()
                }}
              >
                {t('common.signIn')}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  openSignUp()
                }}
                className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-1.5 text-sm font-medium text-white"
              >
                {t('common.signUp')}
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
