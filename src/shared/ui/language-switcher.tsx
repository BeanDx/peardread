import { useTranslation } from 'react-i18next'
import { cn } from '../lib/cn'
import { supportedLanguages, type SupportedLanguage } from '../i18n/config'

type LanguageSwitcherProps = {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()
  const currentLanguage: SupportedLanguage = i18n.language.startsWith('ru')
    ? 'ru'
    : 'en'

  const setLanguage = (language: SupportedLanguage) => {
    if (language !== currentLanguage) {
      void i18n.changeLanguage(language)
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1',
        className,
      )}
    >
      {supportedLanguages.map((language) => {
        const isActive = language === currentLanguage
        return (
          <button
            key={language}
            type="button"
            onClick={() => setLanguage(language)}
            className={cn(
              'rounded-md px-2.5 py-1.5 text-xs font-medium tracking-wide transition-colors',
              isActive
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:text-slate-200',
            )}
            aria-pressed={isActive}
          >
            {t(`languageSwitcher.${language}`)}
          </button>
        )
      })}
    </div>
  )
}
