import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Play, Zap } from 'lucide-react'
import { KanbanMockup } from '@/components/shared/KanbanMockup'

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const stats = useMemo(
    () =>
      [
        { value: '4 200+', labelKey: 'home.statUsers' as const },
        { value: '380k+', labelKey: 'home.statTasks' as const },
        { value: '92k+', labelKey: 'home.statAi' as const },
      ] as const,
    [],
  )

  return (
    <main className="relative overflow-hidden">
      {/* Gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/20" />
        <div className="absolute top-60 -right-40 h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-900/15" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:pt-24">
        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 dark:border-indigo-800/60 dark:bg-indigo-950/40">
            <Zap className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{t('home.badgeMain')}</span>
            <span className="h-3.5 w-px bg-indigo-300 dark:bg-indigo-700" />
            <span className="text-xs text-indigo-500 dark:text-indigo-400">{t('home.badgeNew')}</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {t('home.headlineBefore')}
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
            {t('home.headlineAccent')}
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-xl text-center text-base text-muted-foreground sm:text-lg">
          {t('home.description')}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90 active:scale-95"
          >
            {t('home.ctaTry')}
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60">
              <Play className="size-2.5 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
            </span>
            {t('home.ctaDemo')}
          </button>
        </div>

        {/* Stats */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {stats.map((s) => (
            <div key={s.labelKey} className="text-center">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t(s.labelKey)}</p>
            </div>
          ))}
        </div>

        {/* AI badge */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
            <Zap className="size-3.5 text-indigo-500" />
            {t('home.aiBlurb')}
          </div>
        </div>

        {/* Kanban mockup */}
        <div className="mx-auto mt-12 max-w-4xl">
          <KanbanMockup />
        </div>
      </div>
    </main>
  )
}
