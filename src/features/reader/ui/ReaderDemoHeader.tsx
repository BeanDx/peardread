import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageContainer } from '../../../shared/layout/PageContainer'
import { Wordmark } from '../../../shared/layout/Wordmark'
import { LanguageSwitcher } from '../../../shared/ui/language-switcher'

type ReaderDemoHeaderProps = {
  title: string
  subtitle?: string
}

export function ReaderDemoHeader({
  title,
  subtitle,
}: ReaderDemoHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <PageContainer>
        <div className="flex h-16 items-center justify-between">
          <Wordmark to="/" />
          <div className="flex items-center gap-3">
            <Link
              to="/reader"
              className="text-sm text-slate-300 transition-colors hover:text-white"
            >
              {t('header.reader')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
        <div className="pb-4">
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {subtitle ?? t('demoReader.headerHint')}
          </p>
        </div>
      </PageContainer>
    </header>
  )
}
