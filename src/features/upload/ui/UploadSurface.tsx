import { motion } from 'framer-motion'
import { useRef, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../shared/ui/button'
import { cn } from '../../../shared/lib/cn'

type UploadSurfaceProps = {
  isParsing: boolean
  errorCode: string | null
  onUpload: (file: File) => Promise<void>
  onTryDemo: () => void
}

const acceptedExtensions = '.txt,.md,.html,.htm,.epub,.fb2'

export function UploadSurface({
  isParsing,
  errorCode,
  onUpload,
  onTryDemo,
}: UploadSurfaceProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dragDepthRef = useRef(0)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleFiles = async (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (!file || isParsing) return
    await onUpload(file)
  }

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepthRef.current = 0
    setIsDragActive(false)
    await handleFiles(event.dataTransfer.files)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
    >
      <motion.div
        onDragEnter={(event) => {
          event.preventDefault()
          dragDepthRef.current += 1
          if (dragDepthRef.current > 0) setIsDragActive(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!isDragActive) setIsDragActive(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
          if (dragDepthRef.current === 0) setIsDragActive(false)
        }}
        onDrop={onDrop}
        animate={
          isDragActive
            ? {
                scale: 1.01,
                borderColor: 'rgba(165,180,252,0.65)',
                backgroundColor: 'rgba(99,102,241,0.14)',
                boxShadow: '0 0 0 1px rgba(165,180,252,0.2), 0 18px 60px -34px rgba(99,102,241,0.65)',
              }
            : {
                scale: 1,
                borderColor: 'rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(15,23,42,0.6)',
                boxShadow: '0 0 0 0 rgba(0,0,0,0)',
              }
        }
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'rounded-2xl border border-dashed p-8 text-center',
          isDragActive && 'ring-1 ring-indigo-300/30',
        )}
      >
        <p className="text-sm uppercase tracking-[0.12em] text-slate-400">
          {t('readerWorkspace.badge')}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{t('readerWorkspace.title')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          {isParsing
            ? t('readerWorkspace.parsingSubtitle')
            : isDragActive
              ? t('readerWorkspace.dragActiveSubtitle')
              : t('readerWorkspace.subtitle')}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={acceptedExtensions}
            onChange={(event) => handleFiles(event.target.files)}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={isParsing}>
            {isParsing ? t('readerWorkspace.parsingCta') : t('readerWorkspace.uploadCta')}
          </Button>
          <Button variant="secondary" onClick={onTryDemo} disabled={isParsing}>
            {t('readerWorkspace.tryDemoCta')}
          </Button>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          {isDragActive
            ? t('readerWorkspace.dragActiveHint')
            : t('readerWorkspace.supportedFormats')}
        </p>
        {errorCode && (
          <p className="mt-4 rounded-lg border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {t(`readerWorkspace.errors.${errorCode}`)}
          </p>
        )}
      </motion.div>
    </motion.section>
  )
}
