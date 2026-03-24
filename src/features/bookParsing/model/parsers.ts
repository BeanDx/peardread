import JSZip from 'jszip'
import type { Book, Chapter } from '../../reader/model/types'
import { BookParseError, type SupportedBookFormat } from './types'
import { paragraphsFromText, safeTitleFromFilename } from './textUtils'

type ParseContext = {
  id: string
  title: string
}

function extractFormat(file: File): SupportedBookFormat | null {
  const ext = file.name.toLowerCase().split('.').pop()
  if (ext === 'txt' || ext === 'md' || ext === 'html' || ext === 'htm' || ext === 'epub' || ext === 'fb2') {
    if (ext === 'htm') return 'html'
    return ext
  }
  return null
}

async function parseTxt(file: File, ctx: ParseContext): Promise<Book> {
  const text = await file.text()
  const paragraphs = paragraphsFromText(text, `${ctx.id}-chapter-1`)
  if (!paragraphs.length) {
    throw new BookParseError('empty_content', 'Text file is empty')
  }
  return {
    id: ctx.id,
    title: ctx.title,
    sourceType: 'upload',
    format: 'txt',
    chapters: [{ id: `${ctx.id}-chapter-1`, title: 'Chapter 1', paragraphs }],
  }
}

function stripMarkdown(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}\d+\.\s+/gm, '')
    .replace(/[*_~>#]/g, '')
}

async function parseMd(file: File, ctx: ParseContext): Promise<Book> {
  const raw = await file.text()
  const text = stripMarkdown(raw)
  const paragraphs = paragraphsFromText(text, `${ctx.id}-chapter-1`)
  if (!paragraphs.length) {
    throw new BookParseError('empty_content', 'Markdown file has no readable text')
  }
  return {
    id: ctx.id,
    title: ctx.title,
    sourceType: 'upload',
    format: 'md',
    chapters: [{ id: `${ctx.id}-chapter-1`, title: 'Chapter 1', paragraphs }],
  }
}

function extractTextFromHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script,style,noscript,template,svg').forEach((node) => node.remove())
  const paragraphs: string[] = []
  doc.querySelectorAll('p,h1,h2,h3,h4,h5,h6,blockquote,li').forEach((node) => {
    const text = node.textContent?.replace(/\s+/g, ' ').trim()
    if (text) paragraphs.push(text)
  })
  if (!paragraphs.length) {
    const bodyText = doc.body?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    if (bodyText) {
      paragraphs.push(...bodyText.split(/(?<=[.!?])\s+/))
    }
  }
  return paragraphs.filter(Boolean)
}

async function parseHtml(file: File, ctx: ParseContext): Promise<Book> {
  const html = await file.text()
  const extracted = extractTextFromHtml(html)
  const paragraphs = extracted.map((text, index) => ({
    id: `${ctx.id}-chapter-1-p-${index + 1}`,
    text,
  }))
  if (!paragraphs.length) {
    throw new BookParseError('empty_content', 'HTML file has no readable text')
  }
  return {
    id: ctx.id,
    title: ctx.title,
    sourceType: 'upload',
    format: 'html',
    chapters: [{ id: `${ctx.id}-chapter-1`, title: 'Chapter 1', paragraphs }],
  }
}

function resolvePath(basePath: string, targetPath: string) {
  if (targetPath.startsWith('/')) {
    return targetPath.slice(1)
  }
  const base = basePath.split('/').slice(0, -1)
  const parts = targetPath.split('/')
  for (const part of parts) {
    if (part === '.' || !part) continue
    if (part === '..') {
      base.pop()
      continue
    }
    base.push(part)
  }
  return base.join('/')
}

function getDirname(path: string) {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/')
}

function normalizeNodeText(value: string) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isLikelyJunkBlock(text: string) {
  const lower = text.toLowerCase()
  if (text.length < 2) return true
  if (/^\d{1,4}$/.test(text)) return true
  if (/^(page|seite)\s+\d{1,4}$/i.test(text)) return true
  if (/^(table of contents|inhalt|contents)$/i.test(lower)) return true
  if (/(isbn|copyright|all rights reserved|erste auflage|edition)/i.test(lower)) {
    return text.length < 120
  }
  const digits = (text.match(/\d/g) ?? []).length
  const letters = (text.match(/\p{L}/gu) ?? []).length
  if (digits > 0 && letters > 0 && digits / Math.max(letters, 1) > 1.2) return true
  return false
}

function postProcessBlocks(blocks: string[]) {
  const cleaned = blocks
    .map((block) => normalizeNodeText(block))
    .filter((block) => !isLikelyJunkBlock(block))
  const deduped: string[] = []
  for (const block of cleaned) {
    if (deduped[deduped.length - 1] === block) continue
    deduped.push(block)
  }
  return deduped
}

function extractTextDiagnosticsFromHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script,style,noscript,template,svg,canvas,iframe').forEach((node) =>
    node.remove(),
  )

  const structuredSelectors = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'blockquote',
    'li',
    'pre',
    'figcaption',
    'article',
    'section',
    'div',
    'span',
  ].join(',')

  const rawBlocks: string[] = []
  const seen = new Set<string>()
  doc.querySelectorAll(structuredSelectors).forEach((node) => {
    const text = normalizeNodeText(node.textContent ?? '')
    if (text.length < 2 || seen.has(text)) {
      return
    }
    const childTextLength = [...node.children].reduce(
      (sum, child) => sum + normalizeNodeText(child.textContent ?? '').length,
      0,
    )
    const ownTextLength = text.length - childTextLength
    if (node.tagName === 'SPAN' && text.length < 40) {
      return
    }
    if (ownTextLength < 12 && node.children.length > 0 && text.length < 50) {
      return
    }
    seen.add(text)
    rawBlocks.push(text)
  })

  if (!rawBlocks.length) {
    const bodyText = normalizeNodeText(doc.body?.textContent ?? '')
    if (bodyText) {
      bodyText
        .split(/(?<=[.!?])\s+/)
        .map((line) => normalizeNodeText(line))
        .filter((line) => line.length > 1)
        .forEach((line) => rawBlocks.push(line))
    }
  }

  const paragraphs = postProcessBlocks(rawBlocks)
  const textChars = paragraphs.reduce((sum, line) => sum + line.length, 0)
  const imageCount = doc.querySelectorAll('img,image,svg image').length
  return { paragraphs, textChars, imageCount }
}

async function parseEpub(file: File, ctx: ParseContext): Promise<Book> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const container = zip.file('META-INF/container.xml')
  if (!container) {
    throw new BookParseError('corrupted_epub', 'container.xml is missing')
  }
  const containerXml = await container.async('text')
  const containerDoc = new DOMParser().parseFromString(containerXml, 'application/xml')
  const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path')
  if (!rootfilePath) {
    throw new BookParseError('corrupted_epub', 'OPF path is missing')
  }

  const opfFile = zip.file(rootfilePath)
  if (!opfFile) {
    throw new BookParseError('corrupted_epub', 'OPF file is missing')
  }

  const opfDoc = new DOMParser().parseFromString(await opfFile.async('text'), 'application/xml')
  const opfDir = getDirname(rootfilePath)

  const title = opfDoc.querySelector('metadata > title, dc\\:title')?.textContent?.trim() || ctx.title
  const author = opfDoc.querySelector('metadata > creator, dc\\:creator')?.textContent?.trim() || undefined

  const manifest = new Map<string, string>()
  const manifestMediaTypes = new Map<string, string>()
  opfDoc.querySelectorAll('manifest > item').forEach((item) => {
    const id = item.getAttribute('id')
    const href = item.getAttribute('href')
    const mediaType = item.getAttribute('media-type')?.toLowerCase() ?? ''
    if (id && href) {
      manifest.set(id, resolvePath(opfDir, href))
      manifestMediaTypes.set(id, mediaType)
    }
  })

  const spineIds = [...opfDoc.querySelectorAll('spine > itemref')]
    .map((itemRef) => itemRef.getAttribute('idref'))
    .filter((value): value is string => Boolean(value))

  const diagnostics = {
    spineFound: spineIds.length > 0,
    spineDocumentsCount: spineIds.length,
    contentDocumentsConsidered: 0,
    contentDocumentsWithText: 0,
    extractedCharacters: 0,
    fallbackExtractionUsed: false,
    fallbackDocumentsCount: 0,
    imageDocumentsCount: 0,
  }

  const chapters: Chapter[] = []
  const consumedPaths = new Set<string>()
  for (let index = 0; index < spineIds.length; index += 1) {
    const spineId = spineIds[index]
    const path = manifest.get(spineId)
    if (!path) {
      continue
    }
    const chapterFile = zip.file(path)
    if (!chapterFile) {
      continue
    }
    diagnostics.contentDocumentsConsidered += 1
    consumedPaths.add(path)
    const chapterHtml = await chapterFile.async('text')
    const extracted = extractTextDiagnosticsFromHtml(chapterHtml)
    const lines = extracted.paragraphs
    diagnostics.extractedCharacters += extracted.textChars
    if (extracted.textChars === 0 && extracted.imageCount > 0) {
      diagnostics.imageDocumentsCount += 1
    }
    if (!lines.length) {
      continue
    }
    diagnostics.contentDocumentsWithText += 1
    const heading = lines[0]
    const mediaType = manifestMediaTypes.get(spineId) ?? ''
    const isNavChapter = mediaType.includes('nav') || path.toLowerCase().includes('toc')
    if (isNavChapter && lines.length <= 2) {
      continue
    }
    chapters.push({
      id: `${ctx.id}-chapter-${index + 1}`,
      title: heading.length > 80 ? `Chapter ${index + 1}` : heading,
      paragraphs: lines.map((text, pIndex) => ({
        id: `${ctx.id}-chapter-${index + 1}-p-${pIndex + 1}`,
        text,
      })),
    })
  }

  if (!chapters.length) {
    diagnostics.fallbackExtractionUsed = true
    const fallbackPaths = Object.keys(zip.files).filter((path) => {
      const normalized = path.toLowerCase()
      if (zip.files[path].dir) return false
      if (consumedPaths.has(path)) return false
      return (
        normalized.endsWith('.xhtml') ||
        normalized.endsWith('.html') ||
        normalized.endsWith('.htm')
      )
    })
    diagnostics.fallbackDocumentsCount = fallbackPaths.length

    for (let index = 0; index < fallbackPaths.length; index += 1) {
      const path = fallbackPaths[index]
      const fileEntry = zip.file(path)
      if (!fileEntry) {
        continue
      }
      diagnostics.contentDocumentsConsidered += 1
      const html = await fileEntry.async('text')
      const extracted = extractTextDiagnosticsFromHtml(html)
      diagnostics.extractedCharacters += extracted.textChars
      if (extracted.textChars === 0 && extracted.imageCount > 0) {
        diagnostics.imageDocumentsCount += 1
      }
      if (!extracted.paragraphs.length) {
        continue
      }
      diagnostics.contentDocumentsWithText += 1
      chapters.push({
        id: `${ctx.id}-fallback-chapter-${index + 1}`,
        title: `Chapter ${chapters.length + 1}`,
        paragraphs: extracted.paragraphs.map((text, pIndex) => ({
          id: `${ctx.id}-fallback-chapter-${index + 1}-p-${pIndex + 1}`,
          text,
        })),
      })
    }
  }

  if (!chapters.length && diagnostics.imageDocumentsCount > 0) {
    throw new BookParseError(
      'image_only_epub',
      'This EPUB appears to contain mostly images or scans without text layer',
    )
  }

  if (!chapters.length) {
    throw new BookParseError('empty_content', 'EPUB has no readable chapters')
  }

  console.info('[peardread][epub-parser] diagnostics', {
    fileName: file.name,
    ...diagnostics,
  })

  return {
    id: ctx.id,
    title,
    author,
    sourceType: 'upload',
    format: 'epub',
    chapters,
  }
}

async function parseFb2(file: File, ctx: ParseContext): Promise<Book> {
  const xml = await file.text()
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const hasParserError = doc.querySelector('parsererror')
  if (hasParserError) {
    throw new BookParseError('parse_failed', 'Unable to parse FB2')
  }

  const title = doc.querySelector('description title-info book-title')?.textContent?.trim() || ctx.title
  const firstName = doc.querySelector('description title-info author first-name')?.textContent?.trim() || ''
  const lastName = doc.querySelector('description title-info author last-name')?.textContent?.trim() || ''
  const author = `${firstName} ${lastName}`.trim() || undefined

  const sections = [...doc.querySelectorAll('body section')]
  const chapters: Chapter[] = sections
    .map((section, index) => {
      const sectionTitle =
        section.querySelector(':scope > title')?.textContent?.replace(/\s+/g, ' ').trim() ||
        `Chapter ${index + 1}`
      const paragraphs = [...section.querySelectorAll(':scope > p')]
        .map((p, pIndex) => ({
          id: `${ctx.id}-chapter-${index + 1}-p-${pIndex + 1}`,
          text: p.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        }))
        .filter((item) => item.text)
      return {
        id: `${ctx.id}-chapter-${index + 1}`,
        title: sectionTitle,
        paragraphs,
      }
    })
    .filter((chapter) => chapter.paragraphs.length > 0)

  if (!chapters.length) {
    throw new BookParseError('empty_content', 'FB2 has no readable paragraphs')
  }

  return {
    id: ctx.id,
    title,
    author,
    sourceType: 'upload',
    format: 'fb2',
    chapters,
  }
}

export async function parseBook(file: File): Promise<Book> {
  const format = extractFormat(file)
  if (!format) {
    throw new BookParseError('unsupported_format', 'Unsupported file format')
  }

  const maxFileSizeBytes = 12 * 1024 * 1024
  if (file.size > maxFileSizeBytes) {
    throw new BookParseError('file_too_large', 'File is too large')
  }

  const ctx = {
    id: `book-${Date.now()}`,
    title: safeTitleFromFilename(file.name),
  }

  try {
    if (format === 'txt') return parseTxt(file, ctx)
    if (format === 'md') return parseMd(file, ctx)
    if (format === 'html') return parseHtml(file, ctx)
    if (format === 'epub') return parseEpub(file, ctx)
    return parseFb2(file, ctx)
  } catch (error) {
    if (error instanceof BookParseError) {
      throw error
    }
    throw new BookParseError('parse_failed', 'Unable to parse this file')
  }
}
