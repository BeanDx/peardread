import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { TranslationEntry } from './demoReaderData'
import { normalizeWord, resolveDemoTranslation } from './translationResolver'

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

const HOVER_TRANSLATE_DELAY_MS = 850

export function useDemoReader() {
  const { t } = useTranslation()
  const [activeText, setActiveText] = useState<string>('')
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [selectedTokens, setSelectedTokens] = useState<Array<{ id: string; word: string }>>([])
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [hoverState, setHoverState] = useState<HoverState | null>(null)
  const hoverTimerRef = useRef<number | null>(null)
  const hoverAnimationFrameRef = useRef<number | null>(null)
  const hoverSessionRef = useRef(0)
  const popoverHideTimerRef = useRef<number | null>(null)
  const [isQuickPopoverVisible, setIsQuickPopoverVisible] = useState(false)

  const clearHoverTimers = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current)
    }
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

  const currentTranslation = useMemo<TranslationEntry | null>(() => {
    if (!activeText) {
      return null
    }

    return resolveDemoTranslation(activeText, t)
  }, [activeText, t])

  const selectWord = (word: string, tokenId: string, element: HTMLElement) => {
    clearHoverTimers()
    const normalizedWord = normalizeWord(word)
    if (!normalizedWord) {
      return
    }

    if (isMultiSelectMode) {
      setSelectedTokenId(null)
      setPopover(null)
      setSelectedTokens((prev) => {
        const exists = prev.some((token) => token.id === tokenId)
        if (exists) {
          const next = prev.filter((token) => token.id !== tokenId)
          setActiveText(next.map((token) => token.word).join(' '))
          return next
        }

        const next = [...prev, { id: tokenId, word: word.trim() }]
        setActiveText(next.map((token) => token.word).join(' '))
        return next
      })
      return
    }

    const rect = element.getBoundingClientRect()
    clearPopoverHideTimer()
    setActiveText(word.trim())
    setSelectedTokenId(tokenId)
    setSelectedTokens([])
    setIsQuickPopoverVisible(true)
    setPopover({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10,
    })
  }

  const onWordHoverStart = (
    word: string,
    tokenId: string,
    element: HTMLElement,
    event: MouseEvent<HTMLElement>,
  ) => {
    if (isMultiSelectMode) {
      return
    }

    clearHoverTimers()
    clearPopoverHideTimer()
    hoverSessionRef.current += 1
    const sessionId = hoverSessionRef.current
    const startTs = Date.now()
    setHoverState({
      x: event.clientX + 10,
      y: event.clientY + 12,
      progress: 0,
      sessionId,
    })

    const updateProgress = () => {
      const elapsed = Date.now() - startTs
      const progress = Math.min(elapsed / HOVER_TRANSLATE_DELAY_MS, 1)
      setHoverState((prev) =>
        prev && prev.sessionId === sessionId
          ? {
              ...prev,
              progress,
            }
          : null,
      )

      if (progress < 1) {
        hoverAnimationFrameRef.current = window.requestAnimationFrame(updateProgress)
      }
    }

    hoverAnimationFrameRef.current = window.requestAnimationFrame(updateProgress)

    hoverTimerRef.current = window.setTimeout(() => {
      selectWord(word, tokenId, element)
    }, HOVER_TRANSLATE_DELAY_MS)
  }

  const onWordHoverMove = (event: MouseEvent<HTMLElement>) => {
    setHoverState((prev) =>
      prev
        ? {
            ...prev,
            x: event.clientX + 10,
            y: event.clientY + 12,
          }
        : null,
    )
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
      if (!next) {
        setSelectedTokens([])
      }
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
  }
}
