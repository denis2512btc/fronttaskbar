import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useMyCompetenciesQuery } from '@/features/competencies/hooks/use-competencies-queries'
import { isCompetencyBackendUnavailableError } from '@/features/competencies/lib/competency-schema-errors'
import { isSupabaseConfigured } from '@/lib/supabase/client'

interface CompetenciesCompleteGateProps {
  children: ReactNode
}

export function CompetenciesCompleteGate({ children }: CompetenciesCompleteGateProps) {
  const { t } = useTranslation()
  const { user } = useAuthSession()
  const { data: mine, isLoading, isError, error } = useMyCompetenciesQuery(user?.id)

  if (!isSupabaseConfigured) {
    return <>{children}</>
  }

  if (!user) {
    return null
  }

  if (isError && isCompetencyBackendUnavailableError(error)) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2
          className="size-8 animate-spin text-indigo-600 dark:text-indigo-400"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">{t('competencies.gateLoading')}</p>
      </div>
    )
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : t('competencies.gateLoading')
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6">
        <p className="max-w-md text-center text-sm text-destructive">{msg}</p>
        <p className="max-w-md text-center text-xs text-muted-foreground">
          {t('competencies.gateErrorHint')}
        </p>
      </div>
    )
  }

  const hasPrimary = mine?.some((r) => r.is_primary) ?? false
  if (!hasPrimary) {
    return <Navigate to="/onboarding/competencies" replace />
  }

  return <>{children}</>
}
