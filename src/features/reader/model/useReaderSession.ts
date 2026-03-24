import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { normalizeWord } from './tokenization'
import { resolveLocalTranslation } from '../../translation/model/translationResolver'
import type { TranslationEntry } from '../../translation/model/translationData'

type PopoverState = {
  x: number
  y: number
}

type HoverState = {
  x: number
  y: number
  progress: number
  sessionId: number
}

const HOVER_TRANSLATE_DELAY_MS = 900
const CURSOR_OFFSET_X = 12
const CURSOR_OFFSET_Y = 14

export function useReaderSession() {
  const { t, i18n } = useTranslation()
  const [activeText, setActiveText] = useState('')
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [selectedTokens, setSelectedTokens] = useState<Array<{ id: string; word: string }>>([])
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [hoverState, setHoverState] = useState<HoverState | null>(null)
  const [isQuickPopoverVisible, setIsQuickPopoverVisible] = useState(false)
  const hoverTimerRef = useRef<number | null>(null)
  const hoverAnimationFrameRef = useRef<number | null>(null)
  const hoverSessionRef = useRef(0)
  const popoverHideTimerRef = useRef<number | null>(null)
  const hoverAnchorRef = useRef<{ x: number; y: number } | null>(null)

  const unavailableText =
    i18n.language === 'ru'
      ? 'Локальный перевод пока недоступен'
      : 'Local translation is not available yet'

  const clearHoverTimers = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current)
    if (hoverAnimationFrameRef.current) {
      window.cancelAnimationFrame(hoverAnimationFrameRef.current)
    }
    hoverTimerRef.current = null
    hoverAnimationFrameRef.current = null
    setHoverState(null)
  }

  const clearPopoverHideTimer = () => {
    if (popoverHideTimerRef.current) {
      window.clearTimeout(popoverHideTimerRef.current)
      popoverHideTimerRef.current = null
    }
  }

  const selectedPhrase = useMemo(
    () => selectedTokens.map((item) => item.word).join(' '),
    [selectedTokens],
  )

  const currentTranslation = useMemo<TranslationEntry | null>(
    () => resolveLocalTranslation(activeText, unavailableText),
    [activeText, unavailableText],
  )

  const selectWord = (
    word: string,
    tokenId: string,
    element: HTMLElement,
    anchor?: { x: number; y: number },
  ) => {
    clearHoverTimers()
    if (!word.trim()) return
    const normalizedWord = normalizeWord(word)
    if (normalizedWord.length <= 1 || /^\d+([.,:/-]\d+)*$/.test(normalizedWord)) {
      return
    }

    if (isMultiSelectMode) {
      setSelectedTokenId(null)
      setPopover(null)
      setSelectedTokens((prev) => {
        const exists = prev.some((token) => token.id === tokenId)
        const next = exists
          ? prev.filter((token) => token.id !== tokenId)
          : [...prev, { id: tokenId, word: word.trim() }]
        setActiveText(next.map((token) => token.word).join(' '))
        return next
      })
      return
    }

    clearPopoverHideTimer()
    setActiveText(word.trim())
    setSelectedTokenId(tokenId)
    setSelectedTokens([])
    setIsQuickPopoverVisible(true)
    if (anchor) {
      setPopover({ x: anchor.x + CURSOR_OFFSET_X, y: anchor.y + CURSOR_OFFSET_Y })
    } else {
      const rect = element.getBoundingClientRect()
      setPopover({ x: rect.left + rect.width / 2, y: rect.bottom + 10 })
    }
  }

  const onWordHoverStart = (
    word: string,
    tokenId: string,
    element: HTMLElement,
    event: MouseEvent<HTMLElement>,
  ) => {
    if (isMultiSelectMode) return

    clearHoverTimers()
    clearPopoverHideTimer()
    hoverSessionRef.current += 1
    const sessionId = hoverSessionRef.current
    const startTs = Date.now()
    hoverAnchorRef.current = { x: event.clientX, y: event.clientY }
    setHoverState({
      x: event.clientX + CURSOR_OFFSET_X,
      y: event.clientY + CURSOR_OFFSET_Y,
      progress: 0,
      sessionId,
    })

    const updateProgress = () => {
      const elapsed = Date.now() - startTs
      const progress = Math.min(elapsed / HOVER_TRANSLATE_DELAY_MS, 1)
      setHoverState((prev) =>
        prev && prev.sessionId === sessionId ? { ...prev, progress } : null,
      )
      if (progress < 1) {
        hoverAnimationFrameRef.current = window.requestAnimationFrame(updateProgress)
      }
    }

    hoverAnimationFrameRef.current = window.requestAnimationFrame(updateProgress)
    hoverTimerRef.current = window.setTimeout(() => {
      selectWord(word, tokenId, element, hoverAnchorRef.current ?? undefined)
    }, HOVER_TRANSLATE_DELAY_MS)
  }

  const onWordHoverMove = (event: MouseEvent<HTMLElement>) => {
    if (!hoverState) return
    hoverAnchorRef.current = { x: event.clientX, y: event.clientY }
    const nextX = event.clientX + CURSOR_OFFSET_X
    const nextY = event.clientY + CURSOR_OFFSET_Y
    const delta = Math.abs(nextX - hoverState.x) + Math.abs(nextY - hoverState.y)
    if (delta < 16) return
    setHoverState((prev) => (prev ? { ...prev, x: nextX, y: nextY } : null))
  }

  const onWordHoverEnd = () => {
    clearHoverTimers()
    popoverHideTimerRef.current = window.setTimeout(() => {
      setIsQuickPopoverVisible(false)
      setPopover(null)
    }, 140)
  }

  const toggleMultiSelectMode = () => {
    clearHoverTimers()
    clearPopoverHideTimer()
    setIsQuickPopoverVisible(false)
    setIsMultiSelectMode((prev) => {
      const next = !prev
      if (!next) setSelectedTokens([])
      setSelectedTokenId(null)
      setPopover(null)
      setActiveText(next ? selectedPhrase : '')
      return next
    })
  }

  const clearMultiSelection = () => {
    setSelectedTokens([])
    setActiveText('')
  }

  const resetSession = () => {
    clearHoverTimers()
    clearPopoverHideTimer()
    setActiveText('')
    setSelectedTokenId(null)
    setSelectedTokens([])
    setPopover(null)
    setIsMultiSelectMode(false)
    setHoverState(null)
    setIsQuickPopoverVisible(false)
  }

  const isTokenSelected = (tokenId: string) =>
    selectedTokens.some((token) => token.id === tokenId)

  return {
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
    translationPanelLabel: t('readerWorkspace.translationPanel'),
  }
}
