export type Paragraph = {
  id: string
  text: string
}

export type Chapter = {
  id: string
  title: string
  paragraphs: Paragraph[]
}

export type Book = {
  id: string
  title: string
  author?: string
  sourceType: 'demo' | 'upload'
  format: 'txt' | 'md' | 'html' | 'epub' | 'fb2'
  chapters: Chapter[]
}
