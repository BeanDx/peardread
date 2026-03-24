import { useMemo, useState } from 'react'
import { parseBook } from '../../bookParsing/model/parsers'
import { BookParseError } from '../../bookParsing/model/types'
import type { Book } from '../../reader/model/types'

type UploadState = 'idle' | 'parsing' | 'error'

export function useLocalBookUpload() {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorCode, setErrorCode] = useState<BookParseError['code'] | null>(null)

  const uploadBook = async (file: File): Promise<Book | null> => {
    setUploadState('parsing')
    setErrorCode(null)
    try {
      const book = await parseBook(file)
      setUploadState('idle')
      return book
    } catch (error) {
      setUploadState('error')
      if (error instanceof BookParseError) {
        setErrorCode(error.code)
      } else {
        setErrorCode('parse_failed')
      }
      return null
    }
  }

  const resetUploadError = () => {
    setUploadState('idle')
    setErrorCode(null)
  }

  return useMemo(
    () => ({
      uploadState,
      errorCode,
      uploadBook,
      resetUploadError,
      isParsing: uploadState === 'parsing',
    }),
    [uploadState, errorCode],
  )
}
