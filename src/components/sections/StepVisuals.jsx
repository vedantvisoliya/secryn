import { useState } from 'react'
import { Check, Copy, Eye, EyeOff, ShieldX } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Button } from '@/components/ui/button'
import { GoogleMarkTile } from '@/components/shared/GoogleLogo'

/**
 * Product-UI mocks for the "How it works" steps.
 *
 * Secryn has no CLI, so these panels show the actual screens rather than a
 * terminal transcript. They share the chrome of the hero pipeline so the whole
 * page reads as one instrument.
 */
function Panel({ title, status, statusTone = 'text-ink-500', children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-ink-900/60">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-ink-925/80 px-4 py-2.5">
        <span className="label-mono text-ink-500">{title}</span>
        {status ? (
          <span className={cn('label-mono', statusTone)}>{status}</span>
        ) : null}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}

/** A read-only field that reads as an input without pretending to be one. */
function Field({ label, value, mono = true, className }) {
  return (
    <div className={className}>
      <p className="label-mono text-ink-600">{label}</p>
      <p
        className={cn(
          'mt-2 rounded-md border border-border bg-ink-925/70 px-3 py-2.5 text-sm break-all text-ink-100',
          mono && 'font-mono text-[0.8125rem]',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function SignInVisual() {
  const code = ['4', '8', '1', '9', '0', '2']

  return (
    <Panel title="secryn · sign in" status="verified" statusTone="text-signal">
      <div className="flex items-center gap-3 rounded-md border border-border bg-ink-850 px-4 py-3">
        <GoogleMarkTile />
        <span className="text-sm text-ink-100">Continue with Google</span>
      </div>

      <div className="my-5 flex items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="label-mono text-ink-600">then</span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <p className="label-mono text-ink-600">Authenticator code</p>
      <div className="mt-2 flex gap-2">
        {code.map((digit, index) => (
          <span
            key={`${digit}-${index}`}
            className={cn(
              'grid h-11 flex-1 place-items-center rounded-md border bg-ink-925/70 font-mono text-base text-ink-100',
              index === code.length - 1
                ? 'border-signal-dim text-signal'
                : 'border-border',
            )}
          >
            {digit}
          </span>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-2 border-t border-border pt-4 font-mono text-xs text-ink-400">
        <Check aria-hidden="true" className="size-3.5 text-signal" />
        vedant@northbound.dev · session expires in 15 min
      </p>
    </Panel>
  )
}

function SealVisual() {
  return (
    <Panel title="secryn · new secret" status="ready to seal" statusTone="text-cipher">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" value="STRIPE_SECRET_KEY" className="sm:col-span-2" />
        <Field label="Value" value="••••••••••••••••••••••••••••" className="sm:col-span-2" />
        <Field label="Passphrase" value="••••••••••••" />
        <Field label="Expires" value="90 days" />
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Seal secret
        </span>
        <span className="label-mono text-ink-600">
          pbkdf2 600,000 · aes-256-gcm
        </span>
      </div>
    </Panel>
  )
}

function RevealVisual() {
  const [revealed, setRevealed] = useState(false)
  const { copied, copy } = useCopyToClipboard()
  const secret = 'sk_live_51H8xQ2LkpM4vNc7RtYbGf3'

  return (
    <Panel
      title="secryn · STRIPE_SECRET_KEY"
      status={revealed ? 'tag verified' : 'masked'}
      statusTone={revealed ? 'text-signal' : 'text-ink-500'}
    >
      <p className="label-mono text-ink-600">Value</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <p
          className={cn(
            'flex-1 rounded-md border border-border bg-ink-925/70 px-3 py-2.5 font-mono text-[0.8125rem] break-all transition-colors',
            revealed ? 'text-ink-50' : 'text-ink-400',
          )}
        >
          {revealed ? secret : '••••••••••••••••••••••••••••'}
        </p>

        <span className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRevealed((current) => !current)}
            className="h-9 border-border bg-transparent text-ink-200 hover:border-border-strong hover:bg-ink-850 hover:text-ink-50"
          >
            {revealed ? <EyeOff /> : <Eye />}
            {revealed ? 'Hide' : 'Reveal'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={!revealed}
            onClick={() => copy(secret)}
            aria-label={copied ? 'Copied' : 'Copy secret value'}
            className="size-9 text-ink-400 hover:bg-ink-850 hover:text-ink-100"
          >
            {copied ? <Check className="text-signal" /> : <Copy />}
          </Button>
        </span>
      </div>

      <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 font-mono text-xs leading-relaxed text-ink-500">
        <ShieldX aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-flare" />
        A wrong passphrase fails tag verification. No partial value, no hint.
      </p>
    </Panel>
  )
}

const VISUALS = {
  signin: SignInVisual,
  seal: SealVisual,
  reveal: RevealVisual,
}

export function StepVisual({ name }) {
  const Component = VISUALS[name]
  return Component ? <Component /> : null
}
