import { AnimatePresence, motion } from 'framer-motion'
import { memo, useMemo, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { isInteractiveToken, splitTextToTokens } from '../model/tokenization'
import type { Paragraph } from '../model/types'
import { cn } from '../../../shared/lib/cn'
import { useTranslation } from 'react-i18next'

type ReaderDemoTextProps = {
  paragraphs: Paragraph[]
  selectedTokenId: string | null
  isMultiSelectMode: boolean
  isTokenSelected: (tokenId: string) => boolean
  hoverState: { x: number; y: number; progress: number; sessionId: number } | null
  onWordClick: (word: string, tokenId: string, element: HTMLElement) => void
  onWordHoverStart: (
    word: string,
    tokenId: string,
    element: HTMLElement,
    event: MouseEvent<HTMLElement>,
  ) => void
  onWordHoverMove: (event: MouseEvent<HTMLElement>) => void
  onWordHoverEnd: () => void
  pageIndex: number
  totalPages: number
  canGoPrev: boolean
  canGoNext: boolean
  onPrevPage: () => void
  onNextPage: () => void
  pageTransitionDirection: 1 | -1
}

type TokenizedParagraph = {
  id: string
  paragraphIndex: number
  tokens: string[]
}

type ReaderParagraphProps = {
  paragraph: TokenizedParagraph
  paragraphIndex: number
  selectedTokenId: string | null
  isMultiSelectMode: boolean
  isTokenSelected: (tokenId: string) => boolean
  onWordClick: (word: string, tokenId: string, element: HTMLElement) => void
  onWordHoverStart: (
    word: string,
    tokenId: string,
    element: HTMLElement,
    event: MouseEvent<HTMLElement>,
  ) => void
  onWordHoverMove: (event: MouseEvent<HTMLElement>) => void
  onWordHoverEnd: () => void
}

const ReaderParagraph = memo(function ReaderParagraph({
  paragraph,
  paragraphIndex,
  selectedTokenId,
  isMultiSelectMode,
  isTokenSelected,
  onWordClick,
  onWordHoverStart,
  onWordHoverMove,
  onWordHoverEnd,
}: ReaderParagraphProps) {
  return (
    <p>
      {paragraph.tokens.map((part, tokenIndex) => {
        const isWord = isInteractiveToken(part)
        if (!isWord) {
          return <span key={`${paragraphIndex}-${tokenIndex}-space`}>{part}</span>
        }

        const tokenId = `${paragraphIndex}-${tokenIndex}`
        const isActive = tokenId === selectedTokenId
        const isSelectedInMulti = isTokenSelected(tokenId)

        return (
          <span
            key={tokenId}
            role="button"
            tabIndex={0}
            onClick={(event) => onWordClick(part, tokenId, event.currentTarget)}
            onMouseEnter={(event) =>
              onWordHoverStart(part, tokenId, event.currentTarget, event)
            }
            onMouseMove={onWordHoverMove}
            onMouseLeave={onWordHoverEnd}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onWordClick(part, tokenId, event.currentTarget)
              }
            }}
            className={cn(
              'cursor-pointer rounded px-0.5 transition-colors duration-150 hover:bg-indigo-400/20 hover:text-indigo-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-300/70',
              isActive && 'bg-indigo-400/25 text-indigo-100',
              isMultiSelectMode &&
                isSelectedInMulti &&
                'bg-indigo-400/30 text-indigo-100 ring-1 ring-indigo-300/60',
            )}
          >
            {part}
          </span>
        )
      })}
    </p>
  )
})

export function ReaderDemoText({
  paragraphs,
  selectedTokenId,
  isMultiSelectMode,
  isTokenSelected,
  hoverState,
  onWordClick,
  onWordHoverStart,
  onWordHoverMove,
  onWordHoverEnd,
  pageIndex,
  totalPages,
  canGoPrev,
  canGoNext,
  onPrevPage,
  onNextPage,
  pageTransitionDirection,
}: ReaderDemoTextProps) {
  const { t } = useTranslation()
  const hasDocument = typeof document !== 'undefined'

  const tokenizedParagraphs = useMemo<TokenizedParagraph[]>(
    () =>
      paragraphs.map((paragraph, paragraphIndex) => ({
        id: paragraph.id,
        paragraphIndex,
        tokens: splitTextToTokens(paragraph.text),
      })),
    [paragraphs],
  )

  return (
    <section className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={!canGoPrev}
          className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t('readerWorkspace.prevPage')}
        </button>
        <p className="text-xs text-slate-400">
          {t('readerWorkspace.pageLabel', {
            current: pageIndex + 1,
            total: totalPages,
          })}
        </p>
        <button
          type="button"
          onClick={onNextPage}
          disabled={!canGoNext}
          className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t('readerWorkspace.nextPage')}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`page-${pageIndex}`}
          initial={{ opacity: 0, x: pageTransitionDirection > 0 ? 16 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: pageTransitionDirection > 0 ? -12 : 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="h-[62vh] overflow-hidden space-y-6 text-[1.08rem] leading-8 text-slate-200"
        >
          {tokenizedParagraphs.map((paragraph) => (
            <ReaderParagraph
              key={paragraph.id}
              paragraph={paragraph}
              paragraphIndex={paragraph.paragraphIndex}
              selectedTokenId={selectedTokenId}
              isMultiSelectMode={isMultiSelectMode}
              isTokenSelected={isTokenSelected}
              onWordClick={onWordClick}
              onWordHoverStart={onWordHoverStart}
              onWordHoverMove={onWordHoverMove}
              onWordHoverEnd={onWordHoverEnd}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={!canGoPrev}
          className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t('readerWorkspace.prevPage')}
        </button>
        <button
          type="button"
          onClick={onNextPage}
          disabled={!canGoNext}
          className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t('readerWorkspace.nextPage')}
        </button>
      </div>

      {hasDocument &&
        createPortal(
          <AnimatePresence>
            {hoverState && !isMultiSelectMode && (
              <motion.div
                key={hoverState.sessionId}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="pointer-events-none fixed z-30"
                style={{ left: hoverState.x, top: hoverState.y }}
              >
                <div className="relative h-7 w-7">
                  <svg className="h-7 w-7 -rotate-90">
                    <circle
                      cx="14"
                      cy="14"
                      r="11"
                      fill="none"
                      stroke="rgba(148,163,184,0.3)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="14"
                      cy="14"
                      r="11"
                      fill="none"
                      stroke="rgba(165,180,252,0.95)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 11}`}
                      strokeDashoffset={`${(1 - hoverState.progress) * 2 * Math.PI * 11}`}
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  )
}
