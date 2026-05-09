import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/shared/PageContainer'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { CompetenciesEditor } from '@/features/competencies/components/CompetenciesEditor'

export function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuthSession()

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold">{t('settingsPage.title')}</h1>
      <p className="mt-2 text-muted-foreground">
        {t('settingsPage.description')}
      </p>

      {user ? (
        <section className="mt-10 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{t('settingsPage.competenciesSection')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('settingsPage.competenciesSectionHint')}
          </p>
          <div className="mt-6">
            <CompetenciesEditor userId={user.id} variant="settings" />
          </div>
        </section>
      ) : null}
    </PageContainer>
  )
}
