import { useTranslation } from 'react-i18next'

export function HowItWorks() {
  const { t } = useTranslation()
  return (
    <section className="py-20 px-6 bg-muted/40">
      <h2 className="mb-12 text-center text-3xl font-bold">{t('landing.howTitle')}</h2>
      {/* Steps will go here */}
    </section>
  )
}
