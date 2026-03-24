import { PageTransition } from '../../shared/layout/PageTransition'
import { demoBook } from '../../features/reader/model/demoBook'
import { ReaderWorkspace } from '../../features/reader/ui/ReaderWorkspace'

export function ReaderDemoPage() {
  return (
    <PageTransition>
      <ReaderWorkspace book={demoBook} />
    </PageTransition>
  )
}
