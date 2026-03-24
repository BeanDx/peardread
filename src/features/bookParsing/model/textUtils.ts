import type { Paragraph } from '../../reader/model/types'

export function paragraphsFromText(text: string, prefix: string): Paragraph[] {
  return text
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((item, index) => ({
      id: `${prefix}-p-${index + 1}`,
      text: item,
    }))
}

export function safeTitleFromFilename(name: string) {
  return name.replace(/\.[^.]+$/, '').trim() || 'Untitled Book'
}
