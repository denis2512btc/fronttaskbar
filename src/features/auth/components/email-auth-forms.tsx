import { useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createLoginSchema, createRegisterSchema } from '@/lib/validations/auth'
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
  const { t } = useTranslation()
  const baseId = useId()
  const emailId = `${baseId}-email`
  const passwordId = `${baseId}-password`

  const loginSchema = useMemo(() => createLoginSchema(t), [t])

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
      setApiError(err instanceof Error ? err.message : t('auth.genericError'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={emailId}>{t('auth.email')}</Label>
        <Input
          id={emailId}
          type="email"
          placeholder={t('auth.placeholderEmail')}
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={passwordId}>{t('auth.password')}</Label>
        <Input
          id={passwordId}
          type="password"
          placeholder={t('auth.placeholderPassword')}
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
        {t('common.signIn')}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <button
          type="button"
          onClick={switchToSignUp}
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {t('common.signUp')}
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
  const { t } = useTranslation()
  const baseId = useId()
  const nameId = `${baseId}-name`
  const emailId = `${baseId}-email`
  const passwordId = `${baseId}-password`

  const registerSchema = useMemo(() => createRegisterSchema(t), [t])

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
      setApiError(err instanceof Error ? err.message : t('auth.genericError'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={nameId}>{t('auth.name')}</Label>
        <Input
          id={nameId}
          type="text"
          placeholder={t('auth.placeholderName')}
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={emailId}>{t('auth.email')}</Label>
        <Input
          id={emailId}
          type="email"
          placeholder={t('auth.placeholderEmail')}
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={passwordId}>{t('auth.password')}</Label>
        <Input
          id={passwordId}
          type="password"
          placeholder={t('auth.placeholderPassword')}
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
        {t('auth.createAccountBtn')}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        {t('auth.haveAccount')}{' '}
        <button
          type="button"
          onClick={switchToSignIn}
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {t('common.signIn')}
        </button>
      </p>
    </form>
  )
}
