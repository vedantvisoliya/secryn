import { ArrowLeft, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/Logo'

const GRID_MASK = 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 25%, transparent 80%)'
const GLOW = 'radial-gradient(closest-side, var(--color-ink-50), transparent)'

const STEPS = [
  { id: 'signin', label: 'Sign in' },
  { id: 'secure', label: 'Secure' },
  { id: 'vault', label: 'Vault' },
]

function StepRail({ current }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={step.id}
            className={cn(
              'flex items-center gap-2',
              index < STEPS.length - 1 && 'flex-1',
            )}
          >
            <span
              className={cn(
                'flex shrink-0 items-center gap-2 label-mono transition-colors',
                done && 'text-signal',
                active && 'text-ink-100',
                !done && !active && 'text-ink-600',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-4 place-items-center rounded-full border text-[0.5rem]',
                  done && 'border-signal/40 bg-signal-deep',
                  active && 'border-ink-400',
                  !done && !active && 'border-ink-700',
                )}
              >
                {done ? <Check className="size-2.5" /> : index + 1}
              </span>
              {step.label}
            </span>
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  'h-px flex-1 transition-colors',
                  done ? 'bg-signal/40' : 'bg-border',
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * One shell for every auth screen so the flow reads as a single sequence
 * rather than three unrelated pages. Only the card contents swap.
 */
export function AuthShell({ step = 0, title, description, children, footer }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="grid-field pointer-events-none absolute inset-0 opacity-70"
        style={{ maskImage: GRID_MASK, WebkitMaskImage: GRID_MASK }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[26rem] w-[64rem] max-w-[130vw] -translate-x-1/2 opacity-[0.12]"
        style={{ background: GLOW }}
      />

      <header className="relative flex items-center justify-between gap-4 px-(--gutter) py-6">
        <a href="/" className="rounded-sm transition-opacity hover:opacity-80">
          <Logo />
        </a>
        <a
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-ink-100"
        >
          <ArrowLeft
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
          />
          Back to site
        </a>
      </header>

      <main className="relative flex flex-1 items-start justify-center px-(--gutter) pt-6 pb-16 sm:items-center sm:pt-0">
        <div className="w-full max-w-md">
          <StepRail current={step} />

          <div className="mt-6 rounded-xl border border-border bg-ink-900/70 p-6 sm:p-8">
            <h1 className="text-h2 text-ink-50">{title}</h1>
            {description ? (
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-400">
                {description}
              </p>
            ) : null}
            <div className="mt-7">{children}</div>
          </div>

          {footer ? (
            <div className="mt-6 text-center text-xs text-ink-500">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  )
}

/** Inline, non-blocking error line used by every auth step. */
export function FormError({ id, children }) {
  if (!children) return null
  return (
    <p
      id={id}
      role="alert"
      className="mt-4 flex items-start gap-2 rounded-md border border-flare/25 bg-flare-deep/40 px-3 py-2.5 text-[0.8125rem] leading-relaxed text-flare"
    >
      <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-flare" />
      {children}
    </p>
  )
}
