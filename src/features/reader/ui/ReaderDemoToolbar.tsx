import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/lib/cn'

type ReaderDemoToolbarProps = {
  isMultiSelectMode: boolean
  selectedPhrase: string
  onToggleMultiSelect: () => void
  onClearSelection: () => void
}

export function ReaderDemoToolbar({
  isMultiSelectMode,
  selectedPhrase,
  onToggleMultiSelect,
  onClearSelection,
}: ReaderDemoToolbarProps) {
  const { t } = useTranslation()

  return (
    <section className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onToggleMultiSelect}
          className={cn(
            'rounded-lg border px-3 py-2 text-sm transition-colors',
            isMultiSelectMode
              ? 'border-indigo-300/50 bg-indigo-400/20 text-indigo-100'
              : 'border-white/10 bg-slate-900 text-slate-300 hover:border-white/20 hover:text-white',
          )}
        >
          {isMultiSelectMode
            ? t('demoReader.multiSelectOn')
            : t('demoReader.multiSelectOff')}
        </button>

        {isMultiSelectMode && (
          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white"
          >
            {t('demoReader.clearSelection')}
          </button>
        )}

        <p className="text-sm text-slate-400">
          {isMultiSelectMode
            ? t('demoReader.multiSelectHint')
            : t('demoReader.hoverHint')}
        </p>
      </div>

      {isMultiSelectMode && selectedPhrase && (
        <p className="mt-3 text-sm text-slate-300">
          <span className="text-slate-400">{t('demoReader.selectedPhraseLabel')}</span>{' '}
          <span className="text-indigo-200">{selectedPhrase}</span>
        </p>
      )}
    </section>
  )
}
