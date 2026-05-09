import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, Zap } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { CompetenciesEditor } from '@/features/competencies/components/CompetenciesEditor'
import { useMyCompetenciesQuery } from '@/features/competencies/hooks/use-competencies-queries'
import { isCompetencyBackendUnavailableError } from '@/features/competencies/lib/competency-schema-errors'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export function CompetenciesOnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, loading } = useAuthSession()
  const {
    data: mine,
    isLoading: mineLoading,
    isError: mineError,
    error: mineErr,
  } = useMyCompetenciesQuery(user?.id)

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

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!isSupabaseConfigured) {
    return <Navigate to="/" replace />
  }

  if (mineError && isCompetencyBackendUnavailableError(mineErr)) {
    return <Navigate to="/" replace />
  }

  if (mineLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-950 dark:to-violet-950">
        <Loader2
          className="size-8 animate-spin text-indigo-600 dark:text-indigo-400"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  const hasPrimary = mine?.some((r) => r.is_primary) ?? false
  if (hasPrimary) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-950 dark:to-violet-950">
      <Card className="w-full max-w-lg rounded-xl border-border/60 shadow-sm">
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
              {t('competencies.onboardingTitle')}
            </CardTitle>
            <CardDescription className="text-base">
              {t('competencies.onboardingSubtitle')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <CompetenciesEditor
            userId={user.id}
            variant="onboarding"
            onSaved={() => {
              navigate('/', { replace: true })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
