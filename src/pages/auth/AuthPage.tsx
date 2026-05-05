import { useEffect, useState } from 'react'
import { Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Zap, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SignUpResult } from '@/features/auth/api/auth-api'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import {
  EmailSignInForm,
  EmailSignUpForm,
} from '@/features/auth/components/email-auth-forms'
import { GoogleSignInSection } from '@/features/auth/components/google-sign-in-section'

type Mode = 'signin' | 'signup'

export function AuthPage() {
  const { t } = useTranslation()
  const { user, loading } = useAuthSession()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState<Mode>('signin')
  const [apiError, setApiError] = useState<string | null>(null)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [signUpNotice, setSignUpNotice] = useState<string | null>(null)

  useEffect(() => {
    const err = searchParams.get('error')
    if (!err) return
    const id = requestAnimationFrame(() => {
      setOauthError(err)
      setSearchParams({}, { replace: true })
    })
    return () => cancelAnimationFrame(id)
  }, [searchParams, setSearchParams])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-950 dark:to-violet-950">
        <Loader2
          className="size-8 animate-spin text-indigo-600 dark:text-indigo-400"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">{t('auth.loadingSession')}</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSignUpComplete = (result: SignUpResult) => {
    if (result.session) {
      setSignUpNotice(null)
      navigate('/', { replace: true })
      return
    }
    if (result.needsEmailConfirmation) {
      setSignUpNotice(t('auth.emailConfirmNotice'))
      return
    }
    setSignUpNotice(null)
    navigate('/', { replace: true })
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setApiError(null)
    setSignUpNotice(null)
    setOauthError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-950 dark:to-violet-950">
      <Card className="w-full max-w-md shadow-sm rounded-xl border-border/60">
        <CardHeader className="space-y-4 text-center">
          <Link
            to="/"
            className="mx-auto flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm transition-opacity hover:opacity-90"
            aria-label={t('auth.homeAria')}
          >
            <Zap className="size-5 text-white" strokeWidth={2.5} />
          </Link>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {mode === 'signin' ? t('auth.welcomeBack') : t('auth.createAccount')}
            </CardTitle>
            <CardDescription className="text-base">
              {mode === 'signin' ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
            </CardDescription>
          </div>

          <div className="flex rounded-xl border border-border/60 bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                mode === 'signin'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t('common.signIn')}
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                mode === 'signup'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t('common.signUp')}
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {signUpNotice && mode === 'signup' && (
            <p className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-100">
              {signUpNotice}
            </p>
          )}

          {oauthError && (
            <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {oauthError}
            </p>
          )}

          <div className="flex flex-col gap-4">
            <GoogleSignInSection
              onOAuthError={setOauthError}
              dividerBackgroundClass="bg-card"
            />
            {mode === 'signin' ? (
              <EmailSignInForm
                apiError={apiError}
                setApiError={setApiError}
                onSignInSuccess={() => navigate('/', { replace: true })}
                switchToSignUp={() => switchMode('signup')}
              />
            ) : (
              <EmailSignUpForm
                apiError={apiError}
                setApiError={setApiError}
                onSignUpComplete={handleSignUpComplete}
                switchToSignIn={() => switchMode('signin')}
              />
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link
              to="/"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {t('common.backToApp')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
