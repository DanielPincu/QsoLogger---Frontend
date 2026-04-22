import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type ButtonVariant = 'primary' | 'secondary' | 'danger'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'danger'
        ? 'btn-danger'
        : 'btn-secondary'

  return <button className={cn(variantClass, className)} {...props} />
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('radio-panel panel-padding', className)} {...props}>
      {children}
    </div>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: FieldProps) {
  return <input className={cn('field-base', className)} {...props} />
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn('field-base', className)} {...props}>
      {children}
    </select>
  )
}

export function FieldLabel({ className, children }: { className?: string; children: ReactNode }) {
  return <label className={cn('label-caps mb-2 block', className)}>{children}</label>
}

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'signal' | 'amber' | 'danger'
  className?: string
}) {
  const toneClass =
    tone === 'signal'
      ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
      : tone === 'amber'
        ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
        : tone === 'danger'
          ? 'border-rose-400/25 bg-rose-400/10 text-rose-100'
          : 'border-slate-500/30 bg-slate-800/60 text-slate-200'

  return <span className={cn('data-pill', toneClass, className)}>{children}</span>
}

export function StatusBadge({ confirmed }: { confirmed: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]',
        confirmed
          ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200'
          : 'border-amber-400/30 bg-amber-400/12 text-amber-100',
      )}
      data-testid="qso-status"
    >
      <span className={cn('status-dot', confirmed ? 'text-emerald-300 bg-emerald-300' : 'bg-amber-300 text-amber-300')} />
      {confirmed ? 'Confirmed' : 'Not confirmed'}
    </span>
  )
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="radio-panel p-4">
      <div className="label-caps mb-3">{label}</div>
      <div className="text-2xl font-semibold text-white sm:text-3xl">{value}</div>
      {hint ? <div className="mt-2 text-sm text-slate-400">{hint}</div> : null}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <div className="label-caps mb-3">{eyebrow}</div> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card className="border-dashed border-slate-600/50 bg-slate-900/40 text-center">
      <div className="label-caps mb-3">Awaiting Signal</div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">{description}</p>
    </Card>
  )
}

export function SpinnerCard({ label = 'Loading operator panel...' }: { label?: string }) {
  return (
    <div className="app-shell flex items-center justify-center">
      <Card className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-emerald-300/30 border-t-emerald-300" />
        <p className="mt-4 text-sm text-slate-300">{label}</p>
      </Card>
    </div>
  )
}

export { cn }
