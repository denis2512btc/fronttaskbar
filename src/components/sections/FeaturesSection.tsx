import { useTranslation } from 'react-i18next'

export function FeaturesSection() {
  const { t } = useTranslation()
  return (
    <section className="py-20 px-6">
      <h2 className="mb-12 text-center text-3xl font-bold">{t('landing.featuresTitle')}</h2>
      {/* Feature cards will go here */}
    </section>
  )
}
