import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../lib/cn'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  PropsWithChildren & {
    variant?: ButtonVariant
  }

const baseClassName =
  'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 disabled:pointer-events-none disabled:opacity-50'

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-400 text-slate-950 hover:bg-indigo-300 shadow-[0_8px_30px_-12px_rgba(129,140,248,0.8)]',
  secondary:
    'border border-white/15 bg-white/5 text-slate-100 hover:border-white/25 hover:bg-white/10',
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseClassName, variantClassName[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
