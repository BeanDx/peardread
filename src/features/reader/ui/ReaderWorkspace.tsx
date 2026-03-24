import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { flattenBookParagraphs, paginateParagraphs } from '../model/pagination'
import type { Book } from '../model/types'
import { useReaderSession } from '../model/useReaderSession'
import { ReaderDemoHeader } from './ReaderDemoHeader'
import { ReaderDemoText } from './ReaderDemoText'
import { ReaderDemoToolbar } from './ReaderDemoToolbar'
import { TranslationPanel } from './TranslationPanel'
import { TranslationPopover } from './TranslationPopover'
import { PageContainer } from '../../../shared/layout/PageContainer'

type ReaderWorkspaceProps = {
  book: Book
}

export function ReaderWorkspace({ book }: ReaderWorkspaceProps) {
  const { t } = useTranslation()
  const [pageIndex, setPageIndex] = useState(0)
  const [pageTransitionDirection, setPageTransitionDirection] = useState<1 | -1>(1)
  const {
    activeText,
    selectedTokenId,
    selectedPhrase,
    currentTranslation,
    popover,
    isQuickPopoverVisible,
    hoverState,
    isMultiSelectMode,
    selectWord,
    onWordHoverStart,
    onWordHoverMove,
    onWordHoverEnd,
    toggleMultiSelectMode,
    clearMultiSelection,
    isTokenSelected,
    resetSession,
  } = useReaderSession()

  const flatParagraphs = useMemo(() => flattenBookParagraphs(book), [book])
  const chapterPages = useMemo(() => paginateParagraphs(flatParagraphs), [flatParagraphs])
  const currentPage = useMemo(
    () => chapterPages[Math.min(pageIndex, Math.max(chapterPages.length - 1, 0))] ?? null,
    [chapterPages, pageIndex],
  )
  const canGoPrevPage = pageIndex > 0
  const canGoNextPage = pageIndex < chapterPages.length - 1

  const goToPrevPage = useCallback(() => {
    if (!canGoPrevPage) return
    setPageTransitionDirection(-1)
    setPageIndex((prev) => Math.max(0, prev - 1))
    resetSession()
  }, [canGoPrevPage, resetSession])

  const goToNextPage = useCallback(() => {
    if (!canGoNextPage) return
    setPageTransitionDirection(1)
    setPageIndex((prev) => Math.min(chapterPages.length - 1, prev + 1))
    resetSession()
  }, [canGoNextPage, chapterPages.length, resetSession])

  useEffect(() => {
    if (pageIndex >= chapterPages.length) {
      setPageIndex(0)
      setPageTransitionDirection(1)
      resetSession()
    }
  }, [chapterPages.length, pageIndex, resetSession])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevPage()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNextPage()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goToNextPage, goToPrevPage])

  if (!currentPage) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ReaderDemoHeader
        title={book.title}
        subtitle={
          book.author
            ? `${book.author} - ${t('readerWorkspace.pageLabel', {
                current: pageIndex + 1,
                total: chapterPages.length,
              })}`
            : `${t('readerWorkspace.pageLabel', {
                current: pageIndex + 1,
                total: chapterPages.length,
              })}`
        }
      />

      <main className="py-8 lg:py-10">
        <PageContainer>
          <ReaderDemoToolbar
            isMultiSelectMode={isMultiSelectMode}
            selectedPhrase={selectedPhrase}
            onToggleMultiSelect={toggleMultiSelectMode}
            onClearSelection={clearMultiSelection}
          />

          <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <motion.div
              key={book.id}
              initial={{ opacity: 0.65, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <ReaderDemoText
                paragraphs={currentPage.paragraphs}
                selectedTokenId={selectedTokenId}
                isMultiSelectMode={isMultiSelectMode}
                isTokenSelected={isTokenSelected}
                hoverState={hoverState}
                onWordClick={selectWord}
                onWordHoverStart={onWordHoverStart}
                onWordHoverMove={onWordHoverMove}
                onWordHoverEnd={onWordHoverEnd}
                pageIndex={pageIndex}
                totalPages={chapterPages.length}
                canGoPrev={canGoPrevPage}
                canGoNext={canGoNextPage}
                onPrevPage={goToPrevPage}
                onNextPage={goToNextPage}
                pageTransitionDirection={pageTransitionDirection}
              />
            </motion.div>

            <div className="lg:sticky lg:top-24">
              <TranslationPanel activeText={activeText} translation={currentTranslation} />
            </div>
          </section>

          {book.format === 'epub' && (
            <p className="mt-4 text-xs text-slate-400">{t('readerWorkspace.epubHint')}</p>
          )}
        </PageContainer>
      </main>

      <TranslationPopover
        isVisible={!isMultiSelectMode && isQuickPopoverVisible}
        translation={isMultiSelectMode ? null : currentTranslation}
        popover={isMultiSelectMode ? null : popover}
      />
    </div>
  )
}
