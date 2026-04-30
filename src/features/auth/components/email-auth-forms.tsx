import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import type { LoginInput, RegisterInput } from '@/lib/validations/auth'
import { signIn, signUp, type SignUpResult } from '@/features/auth/api/auth-api'

const submitButtonClassName =
  'flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60'

export interface EmailSignInFormProps {
  apiError: string | null
  setApiError: (e: string | null) => void
  onSignInSuccess: () => void
  switchToSignUp: () => void
}

export function EmailSignInForm({
  apiError,
  setApiError,
  onSignInSuccess,
  switchToSignUp,
}: EmailSignInFormProps) {
  const baseId = useId()
  const emailId = `${baseId}-email`
  const passwordId = `${baseId}-password`

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setApiError(null)
    try {
      await signIn(data)
      onSignInSuccess()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
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
        <Label htmlFor={passwordId}>Password</Label>
        <Input
          id={passwordId}
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

      <button type="submit" disabled={isSubmitting} className={submitButtonClassName}>
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

export interface EmailSignUpFormProps {
  apiError: string | null
  setApiError: (e: string | null) => void
  onSignUpComplete: (result: SignUpResult) => void
  switchToSignIn: () => void
}

export function EmailSignUpForm({
  apiError,
  setApiError,
  onSignUpComplete,
  switchToSignIn,
}: EmailSignUpFormProps) {
  const baseId = useId()
  const nameId = `${baseId}-name`
  const emailId = `${baseId}-email`
  const passwordId = `${baseId}-password`

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setApiError(null)
    try {
      const result = await signUp(data)
      onSignUpComplete(result)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
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
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
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
        <Label htmlFor={passwordId}>Password</Label>
        <Input
          id={passwordId}
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

      <button type="submit" disabled={isSubmitting} className={submitButtonClassName}>
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
