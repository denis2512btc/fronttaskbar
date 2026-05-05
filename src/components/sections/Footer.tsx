import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
      {t('landing.footer', { year: new Date().getFullYear() })}
    </footer>
  )
}
