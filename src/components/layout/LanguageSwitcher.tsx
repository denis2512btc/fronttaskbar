import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { type SupportedLang, SUPPORTED_LANGS } from '@/lib/i18n/i18n'

const LABELS: Record<SupportedLang, string> = {
  ru: 'RU',
  be: 'BE',
  en: 'EN',
}

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation()
  const active = (i18n.resolvedLanguage ?? i18n.language).split('-')[0]?.toLowerCase() ?? 'ru'

  return (
    <div
      className={cn(
        'flex items-center rounded-lg border border-border bg-muted/40 p-0.5',
        className,
      )}
      role="group"
      aria-label={t('layout.language')}
    >
      {SUPPORTED_LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => void i18n.changeLanguage(code)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            active === code
              ? 'bg-white text-foreground shadow-sm dark:bg-neutral-800'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  )
}
