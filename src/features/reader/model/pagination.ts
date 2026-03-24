import type { Book, Paragraph } from './types'

export type ReaderPage = {
  id: string
  paragraphs: Paragraph[]
}

const MIN_PARAGRAPHS_PER_PAGE = 2
const MAX_PARAGRAPHS_PER_PAGE = 5
const SOFT_TARGET_CHARS = 950
const SOFT_TARGET_WORDS = 170
const HARD_LIMIT_CHARS = 1300
const HARD_LIMIT_WORDS = 235

function countWords(text: string) {
  return text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0
}

export function flattenBookParagraphs(book: Book): Paragraph[] {
  const hasManyChapters = book.chapters.length > 1
  const flat: Paragraph[] = []

  for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
    const chapter = book.chapters[chapterIndex]
    if (hasManyChapters && chapter.title.trim()) {
      flat.push({
        id: `${chapter.id}-title`,
        text: `Chapter: ${chapter.title}`,
      })
    }
    flat.push(...chapter.paragraphs)
  }

  return flat
}

export function paginateParagraphs(paragraphs: Paragraph[]): ReaderPage[] {
  if (!paragraphs.length) {
    return []
  }

  const pages: ReaderPage[] = []
  let current: Paragraph[] = []
  let currentChars = 0
  let currentWords = 0

  const pushCurrentPage = () => {
    if (!current.length) return
    const startId = current[0]?.id ?? 'start'
    const endId = current[current.length - 1]?.id ?? 'end'
    pages.push({
      id: `page-${startId}-${endId}`,
      paragraphs: current,
    })
    current = []
    currentChars = 0
    currentWords = 0
  }

  for (const paragraph of paragraphs) {
    const paragraphChars = paragraph.text.length
    const paragraphWords = countWords(paragraph.text)
    const isVeryLongParagraph =
      paragraphChars >= HARD_LIMIT_CHARS || paragraphWords >= HARD_LIMIT_WORDS
    const nextChars = currentChars + paragraphChars
    const nextWords = currentWords + paragraphWords
    const nextParagraphCount = current.length + 1

    const hitHardLimit =
      current.length > 0 &&
      (nextChars > HARD_LIMIT_CHARS ||
        nextWords > HARD_LIMIT_WORDS ||
        nextParagraphCount > MAX_PARAGRAPHS_PER_PAGE)
    const hitSoftLimitWithEnoughContent =
      current.length >= MIN_PARAGRAPHS_PER_PAGE &&
      (nextChars > SOFT_TARGET_CHARS || nextWords > SOFT_TARGET_WORDS)

    if (hitHardLimit || hitSoftLimitWithEnoughContent) {
      pushCurrentPage()
    }

    current.push(paragraph)
    currentChars += paragraphChars
    currentWords += paragraphWords

    // Long paragraph can occupy a whole page, avoid stacking more after it.
    if (isVeryLongParagraph) {
      pushCurrentPage()
    }
  }

  pushCurrentPage()
  return pages
}
