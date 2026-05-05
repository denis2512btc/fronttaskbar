import { useTranslation } from 'react-i18next'

export function HeroSection() {
  const { t } = useTranslation()
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 px-6 text-white">
      <h1 className="max-w-3xl text-center text-5xl font-bold leading-tight">
        {t('landing.heroTitle')}
      </h1>
      <p className="max-w-xl text-center text-lg text-white/80">
        {t('landing.heroSubtitle')}
      </p>
    </section>
  )
}
