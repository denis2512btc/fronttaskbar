import { useState } from 'react'
import { Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { EmailSignInForm, EmailSignUpForm } from '@/features/auth/components/email-auth-forms'

type Mode = 'signin' | 'signup'

interface AuthDialogProps {
  open: boolean
  defaultMode?: Mode
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, defaultMode = 'signin', onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [apiError, setApiError] = useState<string | null>(null)
  const [signUpNotice, setSignUpNotice] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (next) setMode(defaultMode)
    if (!next) {
      setApiError(null)
      setSignUpNotice(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <span className="mb-1 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Zap className="size-4 text-white" strokeWidth={2.5} />
          </span>
          <DialogTitle className="text-lg">
            {mode === 'signin' ? 'Welcome back' : 'Create an account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin'
              ? 'Sign in to your AITaskBoard account'
              : 'Get started with AITaskBoard for free'}
          </DialogDescription>
        </DialogHeader>

        {signUpNotice && mode === 'signup' && (
          <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-100">
            {signUpNotice}
          </p>
        )}

        {mode === 'signin' ? (
          <EmailSignInForm
            apiError={apiError}
            setApiError={setApiError}
            onSignInSuccess={() => onOpenChange(false)}
            switchToSignUp={() => {
              setMode('signup')
              setApiError(null)
              setSignUpNotice(null)
            }}
          />
        ) : (
          <EmailSignUpForm
            apiError={apiError}
            setApiError={setApiError}
            onSignUpComplete={(result) => {
              if (result.session) {
                setSignUpNotice(null)
                onOpenChange(false)
                return
              }
              if (result.needsEmailConfirmation) {
                setSignUpNotice(
                  'Check your inbox and confirm your email to finish signing up. Then you can sign in.',
                )
                return
              }
              setSignUpNotice(null)
              onOpenChange(false)
            }}
            switchToSignIn={() => {
              setMode('signin')
              setApiError(null)
              setSignUpNotice(null)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
