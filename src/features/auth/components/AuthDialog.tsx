import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Zap, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import type { LoginInput, RegisterInput } from '@/lib/validations/auth'
import { signIn, signUp } from '@/features/auth/api/auth-api'

type Mode = 'signin' | 'signup'

function GoogleAuthButton() {
  return (
    <button
      type="button"
      className="flex h-9 w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/80 active:scale-[0.98]"
      aria-label="Войти через Google"
    >
      <svg className="size-5 shrink-0" aria-hidden viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Войти через Google
    </button>
  )
}

function DividerWithLabel({ children }: { children: ReactNode }) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-popover px-2 text-muted-foreground">{children}</span>
      </div>
    </div>
  )
}

interface AuthDialogProps {
  open: boolean
  defaultMode?: Mode
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, defaultMode = 'signin', onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [apiError, setApiError] = useState<string | null>(null)

  // Reset mode to defaultMode whenever dialog opens
  const handleOpenChange = (next: boolean) => {
    if (next) setMode(defaultMode)
    if (!next) setApiError(null)
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
              ? 'Sign in to your AITaskboard account'
              : 'Get started with AITaskboard for free'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'signin' ? (
          <SignInForm
            apiError={apiError}
            setApiError={setApiError}
            onSuccess={() => onOpenChange(false)}
            switchToSignUp={() => { setMode('signup'); setApiError(null) }}
          />
        ) : (
          <SignUpForm
            apiError={apiError}
            setApiError={setApiError}
            onSuccess={() => onOpenChange(false)}
            switchToSignIn={() => { setMode('signin'); setApiError(null) }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// --- Sign In form ---

interface SignInFormProps {
  apiError: string | null
  setApiError: (e: string | null) => void
  onSuccess: () => void
  switchToSignUp: () => void
}

function SignInForm({ apiError, setApiError, onSuccess, switchToSignUp }: SignInFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setApiError(null)
    try {
      await signIn(data)
      onSuccess()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <GoogleAuthButton />
      <DividerWithLabel>или по email</DividerWithLabel>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {apiError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
        Sign In
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={switchToSignUp}
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Sign Up
        </button>
      </p>
    </form>
  )
}

// --- Sign Up form ---

interface SignUpFormProps {
  apiError: string | null
  setApiError: (e: string | null) => void
  onSuccess: () => void
  switchToSignIn: () => void
}

function SignUpForm({ apiError, setApiError, onSuccess, switchToSignIn }: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setApiError(null)
    try {
      await signUp(data)
      onSuccess()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <GoogleAuthButton />
      <DividerWithLabel>или по email</DividerWithLabel>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {apiError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
        Create Account
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={switchToSignIn}
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Sign In
        </button>
      </p>
    </form>
  )
}
