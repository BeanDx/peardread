import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { TranslationEntry } from '../../translation/model/translationData'

type TranslationPanelProps = {
  activeText: string
  translation: TranslationEntry | null
}

export function TranslationPanel({ activeText, translation }: TranslationPanelProps) {
  const { t } = useTranslation()

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
        {t('demoReader.panelTitle')}
      </p>

      {!translation ? (
        <p className="mt-4 text-sm text-slate-300">
          {t('demoReader.emptyState')}
        </p>
      ) : (
        <motion.div
          key={activeText}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mt-4 space-y-3"
        >
          <div>
            <p className="text-xs text-slate-400">{t('demoReader.selectedLabel')}</p>
            <p className="text-lg font-medium text-white">{translation.text}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('demoReader.russianLabel')}</p>
            <p className="text-base text-indigo-200">{translation.translation}</p>
          </div>
          {translation.partOfSpeech && (
            <p className="inline-flex rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-300">
              {translation.partOfSpeech}
            </p>
          )}
          {translation.note && <p className="text-sm text-slate-300">{translation.note}</p>}
        </motion.div>
      )}
    </aside>
  )
}
