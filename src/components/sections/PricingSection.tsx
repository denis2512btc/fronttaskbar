import { useTranslation } from 'react-i18next'

export function PricingSection() {
  const { t } = useTranslation()
  return (
    <section className="py-20 px-6">
      <h2 className="mb-12 text-center text-3xl font-bold">{t('landing.pricingTitle')}</h2>
      {/* Pricing cards will go here */}
    </section>
  )
}
