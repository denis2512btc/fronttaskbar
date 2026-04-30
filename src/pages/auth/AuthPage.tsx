import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
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

type Mode = 'signin' | 'signup'

export function AuthPage() {
  const { user, loading } = useAuthSession()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [apiError, setApiError] = useState<string | null>(null)
  const [signUpNotice, setSignUpNotice] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-950 dark:to-violet-950">
        <Loader2
          className="size-8 animate-spin text-indigo-600 dark:text-indigo-400"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Loading session…</p>
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
      setSignUpNotice(
        'Check your inbox and confirm your email to finish signing up. Then you can sign in.',
      )
      return
    }
    setSignUpNotice(null)
    navigate('/', { replace: true })
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setApiError(null)
    setSignUpNotice(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-950 dark:to-violet-950">
      <Card className="w-full max-w-md shadow-sm rounded-xl border-border/60">
        <CardHeader className="space-y-4 text-center">
          <Link
            to="/"
            className="mx-auto flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm transition-opacity hover:opacity-90"
            aria-label="На главную"
          >
            <Zap className="size-5 text-white" strokeWidth={2.5} />
          </Link>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription className="text-base">
              {mode === 'signin'
                ? 'Sign in to your AITaskBoard account'
                : 'Get started with AITaskBoard for free'}
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
              Sign In
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
              Sign Up
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {signUpNotice && mode === 'signup' && (
            <p className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-100">
              {signUpNotice}
            </p>
          )}

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

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link
              to="/"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Back to app
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
