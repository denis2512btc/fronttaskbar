import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { EmailSignInForm, EmailSignUpForm } from '@/features/auth/components/email-auth-forms'
import { GoogleSignInSection } from '@/features/auth/components/google-sign-in-section'

type Mode = 'signin' | 'signup'

interface AuthDialogProps {
  open: boolean
  defaultMode?: Mode
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, defaultMode = 'signin', onOpenChange }: AuthDialogProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [apiError, setApiError] = useState<string | null>(null)
  const [signUpNotice, setSignUpNotice] = useState<string | null>(null)
  const [oauthError, setOauthError] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (next) setMode(defaultMode)
    if (!next) {
      setApiError(null)
      setSignUpNotice(null)
      setOauthError(null)
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
            {mode === 'signin' ? t('auth.welcomeBack') : t('auth.createAccount')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
          </DialogDescription>
        </DialogHeader>

        {signUpNotice && mode === 'signup' && (
          <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-100">
            {signUpNotice}
          </p>
        )}

        {oauthError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {oauthError}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <GoogleSignInSection onOAuthError={setOauthError} />
          {mode === 'signin' ? (
            <EmailSignInForm
              apiError={apiError}
              setApiError={setApiError}
              onSignInSuccess={() => onOpenChange(false)}
              switchToSignUp={() => {
                setMode('signup')
                setApiError(null)
                setSignUpNotice(null)
                setOauthError(null)
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
                  setSignUpNotice(t('auth.emailConfirmNotice'))
                  return
                }
                setSignUpNotice(null)
                onOpenChange(false)
              }}
              switchToSignIn={() => {
                setMode('signin')
                setApiError(null)
                setSignUpNotice(null)
                setOauthError(null)
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
