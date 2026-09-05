import { Loader2, X } from 'lucide-react'
import { forwardRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

/* ══════════════════════════════════════════════════════════════
   کیت رابط کاربری

   عمداً کوچک است. هر عنصری که دو بار تکرار شود اینجا می‌آید و
   هر چیز دیگری در محل خودش می‌ماند.
   ══════════════════════════════════════════════════════════════ */

/* ── Button ─────────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'signal' | 'outline' | 'ghost' | 'danger' | 'quiet'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-steel-800 text-white hover:bg-steel-700 active:bg-steel-900 shadow-plate disabled:bg-steel-300',
  signal:
    'bg-signal-400 text-steel-900 font-bold hover:bg-signal-300 active:bg-signal-500 shadow-plate disabled:bg-signal-100 disabled:text-steel-400',
  outline:
    'border border-line-strong bg-paper text-steel-800 hover:border-steel-400 hover:bg-steel-50 disabled:text-steel-300',
  ghost: 'text-steel-600 hover:bg-steel-100 hover:text-steel-900 disabled:text-steel-300',
  danger: 'bg-alert text-white hover:brightness-110 active:brightness-95',
  quiet: 'bg-steel-100 text-steel-700 hover:bg-steel-200 disabled:text-steel-400',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[15px] gap-1.5 rounded-3xl',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[16px] gap-2 rounded-2xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-semibold',
        'transition-[background-color,box-shadow,border-color,color] duration-200',
        'disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  )
}

/* ── Badge ──────────────────────────────────────────────────── */
export type Tone = 'verify' | 'notice' | 'alert' | 'muted' | 'steel' | 'signal'

const badgeTones: Record<Tone, string> = {
  verify: 'bg-verify-soft text-verify border-verify/25',
  notice: 'bg-notice-soft text-notice border-notice/25',
  alert: 'bg-alert-soft text-alert border-alert/25',
  muted: 'bg-steel-100 text-steel-500 border-steel-200',
  steel: 'bg-steel-800 text-white border-steel-800',
  signal: 'bg-signal-100 text-signal-700 border-signal-300',
}

export function Badge({
  tone = 'muted',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[13px] font-semibold leading-5',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ── فرم ────────────────────────────────────────────────────── */
export function Field({
  label,
  hint,
  error,
  required,
  className,
  /** وقتی محتوا یک کنترل فرم نیست (مثلاً گروه دکمه)، به‌جای label از group استفاده کن */
  group,
  children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  group?: boolean
  children: ReactNode
}) {
  const Root = group ? 'div' : 'label'
  return (
    <Root
      className={cn('block', className)}
      {...(group ? { role: 'group', 'aria-label': label } : {})}
    >
      <span className="mb-2 flex items-baseline gap-1 text-[15px] font-semibold text-steel-700">
        {label}
        {required && <span className="text-alert">*</span>}
        {hint && <span className="font-normal text-steel-400">— {hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[14px] font-medium text-alert">{error}</span>}
    </Root>
  )
}

const controlBase =
  'w-full rounded-xl border bg-paper px-4 text-[15px] transition-colors placeholder:text-steel-300 ' +
  'border-line hover:border-steel-300 focus:border-steel-500 focus:outline-none focus:ring-4 focus:ring-steel-500/10 ' +
  'disabled:bg-steel-50 disabled:text-steel-400'

const invalidRing = 'border-alert focus:border-alert focus:ring-alert/15'

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...rest }, ref) {
  return (
    <input
      ref={ref}
      {...rest}
      className={cn(controlBase, 'h-11', invalid && invalidRing, className)}
    />
  )
})

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      {...rest}
      className={cn(controlBase, 'min-h-28 resize-y py-3 leading-8', invalid && invalidRing, className)}
    />
  )
})

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={cn(controlBase, 'h-11 cursor-pointer appearance-none pl-10', className)}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-steel-400"
        width="12" height="12" viewBox="0 0 12 12" fill="none"
      >
        <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function Checkbox({
  label,
  count,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; count?: number }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer select-none items-center gap-3 rounded-3xl px-2.5 py-2 text-[15px] transition-colors hover:bg-steel-50',
        className,
      )}
    >
      <input
        type="checkbox"
        {...rest}
        className="h-4 w-4 shrink-0 cursor-pointer accent-steel-800"
      />
      <span className="flex-1 text-steel-700">{label}</span>
      {count != null && <span className="num text-[13px] text-steel-400">{count}</span>}
    </label>
  )
}

/* ── سطح‌ها ─────────────────────────────────────────────────── */
export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn('rounded-2xl bg-paper shadow-plate', className)}>
      {children}
    </div>
  )
}

export function SectionHead({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-7 flex items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && (
          <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-signal-600">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[22px] font-extrabold text-steel-900 md:text-[28px]">{title}</h2>
      </div>
      {action}
    </div>
  )
}

/* ── Modal ──────────────────────────────────────────────────── */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }

  return createPortal(
    <div
      className="animate-fade fixed inset-0 z-100 flex items-end justify-center bg-steel-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          'animate-sheet flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[24px] bg-paper shadow-panel sm:rounded-3xl',
          widths[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h3 className="text-[19px] font-extrabold text-steel-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[15px] text-steel-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-m-1.5 shrink-0 rounded-3xl p-1.5 text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-700"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-steel-50/70 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

/* ── وضعیت‌های خالی / بارگذاری ──────────────────────────────── */
export function Empty({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-paper px-6 py-16 text-center shadow-plate">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-steel-100 text-steel-400">
          {icon}
        </div>
      )}
      <p className="text-[17px] font-bold text-steel-800">{title}</p>
      {description && <p className="mt-2 max-w-sm text-[15px] leading-7 text-steel-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-3xl bg-steel-100', className)} />
}

export function Spinner({ label = 'در حال بارگذاری…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-steel-400">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  )
}

/* ── نوار پیشرفت ────────────────────────────────────────────── */
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-1 w-full overflow-hidden rounded-full bg-steel-100', className)}>
      <div
        className="h-full rounded-full bg-signal-400 transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

/* ── ستاره امتیاز ───────────────────────────────────────────── */
export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-px" aria-label={`امتیاز ${value} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 1.8l2.4 5 5.5.8-4 3.8.95 5.5L10 14.3l-4.85 2.6.95-5.5-4-3.8 5.5-.8z"
            fill={i <= Math.round(value) ? 'var(--color-signal-400)' : 'var(--color-steel-200)'}
          />
        </svg>
      ))}
    </span>
  )
}
