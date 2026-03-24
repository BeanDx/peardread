import type { Book } from '../../reader/model/types'

export type SupportedBookFormat = 'txt' | 'md' | 'html' | 'epub' | 'fb2'

export type ParseBookResult = {
  book: Book
}

export class BookParseError extends Error {
  code:
    | 'unsupported_format'
    | 'empty_content'
    | 'parse_failed'
    | 'corrupted_epub'
    | 'image_only_epub'
    | 'file_too_large'

  constructor(
    code:
      | 'unsupported_format'
      | 'empty_content'
      | 'parse_failed'
      | 'corrupted_epub'
      | 'image_only_epub'
      | 'file_too_large',
    message: string,
  ) {
    super(message)
    this.code = code
  }
}
