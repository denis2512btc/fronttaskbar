import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/shared/PageContainer'

export function SettingsPage() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold">{t('settingsPage.title')}</h1>
      <p className="mt-2 text-muted-foreground">
        {t('settingsPage.description')}
      </p>
    </PageContainer>
  )
}
