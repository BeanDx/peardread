import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageContainer } from '../../shared/layout/PageContainer'
import { PageTransition } from '../../shared/layout/PageTransition'
import { Wordmark } from '../../shared/layout/Wordmark'
import { Button } from '../../shared/ui/button'
import { LanguageSwitcher } from '../../shared/ui/language-switcher'

export function HomePage() {
  const { t } = useTranslation()
  const featureItems = [
    {
      title: t('home.features.uploadTitle'),
      description: t('home.features.uploadDescription'),
    },
    {
      title: t('home.features.focusTitle'),
      description: t('home.features.focusDescription'),
    },
    {
      title: t('home.features.understandTitle'),
      description: t('home.features.understandDescription'),
    },
  ]

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.14),transparent_42%)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <PageContainer>
          <nav className="flex h-16 items-center justify-between">
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
          </nav>
        </PageContainer>
      </header>

        <main className="py-8 lg:py-10">
          <PageContainer>
            <section className="grid items-center gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <p className="mb-3 text-sm font-medium text-indigo-300">
                {t('home.badge')}
              </p>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                {t('home.title')}
              </h1>
              <p className="mt-3 max-w-xl text-base text-slate-300 md:text-lg">
                {t('home.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/reader">
                  <Button>{t('home.ctaUpload')}</Button>
                </Link>
                <Link to="/reader/demo">
                  <Button variant="secondary">{t('home.ctaDemo')}</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.45, ease: 'easeOut' }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.85)]"
            >
              <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
                <p className="mb-4 text-xs uppercase tracking-[0.12em] text-slate-400">
                  {t('home.previewLabel')}
                </p>
                <p className="leading-relaxed text-slate-200">
                  Heute ging ich fruh durch den stillen Park. Die Luft war
                  kuhl, und die Stadt wirkte fur einen Moment vollig ruhig.
                </p>
                <div className="mt-4 inline-flex rounded-md bg-indigo-400/20 px-2 py-1 text-indigo-200">
                  ruhig
                </div>
                <div className="mt-4 max-w-xs rounded-lg border border-white/10 bg-slate-950/90 p-3 text-sm text-slate-300">
                  <p className="font-medium text-white">
                    {t('home.translationLabel')}
                  </p>
                  <p className="mt-1">
                    <span className="text-indigo-300">ruhig</span> - calm,
                    quiet
                  </p>
                </div>
              </div>
            </motion.div>
            </section>

            <section className="mt-12 grid gap-4 md:grid-cols-3">
              {featureItems.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <h2 className="text-lg font-medium text-white">{feature.title}</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {feature.description}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-12 rounded-2xl border border-white/10 bg-slate-900/70 p-6 md:p-7">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="text-sm text-slate-400">{t('home.notesLabel')}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {t('home.notesTitle')}
                  </h3>
                </div>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>{t('home.notes.formats')}</li>
                  <li>{t('home.notes.language')}</li>
                  <li>{t('home.notes.flow')}</li>
                </ul>
              </div>
            </section>
          </PageContainer>
        </main>
      </div>
    </PageTransition>
  )
}
