import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageTransition } from '../../shared/layout/PageTransition'
import { demoBook } from '../../features/reader/model/demoBook'
import type { Book } from '../../features/reader/model/types'
import { ReaderWorkspace } from '../../features/reader/ui/ReaderWorkspace'
import { useLocalBookUpload } from '../../features/upload/model/useLocalBookUpload'
import { UploadSurface } from '../../features/upload/ui/UploadSurface'

export function ReaderPage() {
  const { t } = useTranslation()
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const { uploadState, errorCode, isParsing, uploadBook, resetUploadError } =
    useLocalBookUpload()

  const handleUpload = async (file: File) => {
    resetUploadError()
    const parsedBook = await uploadBook(file)
    if (parsedBook) {
      setCurrentBook(parsedBook)
    }
  }

  return (
    <PageTransition>
      {currentBook ? (
        <ReaderWorkspace book={currentBook} />
      ) : (
        <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 lg:px-8">
          <UploadSurface
            isParsing={isParsing}
            errorCode={errorCode}
            onUpload={handleUpload}
            onTryDemo={() => setCurrentBook(demoBook)}
          />
          {uploadState === 'idle' && (
            <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-slate-400">
              {t('readerWorkspace.noBackendHint')}
            </p>
          )}
        </div>
      )}
    </PageTransition>
  )
}
