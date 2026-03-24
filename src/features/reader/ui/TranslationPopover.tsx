import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import type { TranslationEntry } from '../../translation/model/translationData'

type TranslationPopoverProps = {
  isVisible: boolean
  translation: TranslationEntry | null
  popover: { x: number; y: number } | null
}

export function TranslationPopover({
  isVisible,
  translation,
  popover,
}: TranslationPopoverProps) {
  const { t } = useTranslation()
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isVisible && translation && popover ? (
        <motion.div
          key={`${translation.text}-${popover.x}-${popover.y}`}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            left: popover.x,
            top: popover.y,
            transform: 'translateX(-50%)',
          }}
          className="z-40 w-72 rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-[0_16px_48px_-24px_rgba(15,23,42,0.95)] backdrop-blur-md"
        >
          <p className="text-xs text-slate-400">{t('demoReader.quickTranslation')}</p>
          <p className="mt-1 text-sm text-white">
            <span className="font-medium">{translation.text}</span>
            <span className="mx-2 text-slate-500">-</span>
            <span className="text-indigo-200">{translation.translation}</span>
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
