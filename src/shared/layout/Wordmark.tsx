import { cn } from '../lib/cn'
import { Link } from 'react-router-dom'

type WordmarkProps = {
  className?: string
  to?: string
}

export function Wordmark({ className, to }: WordmarkProps) {
  const content = (
    <span
      className={cn(
        'text-xl font-semibold tracking-tight transition-all duration-200',
        to &&
          'cursor-pointer hover:-translate-y-0.5 hover:brightness-110 hover:drop-shadow-[0_0_10px_rgba(129,140,248,0.2)]',
        className,
      )}
    >
      <span className="text-slate-300">peard</span>
      <span className="text-indigo-200">read</span>
    </span>
  )

  if (to) {
    return (
      <Link to={to} aria-label="Go to home" className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return (
    content
  )
}
