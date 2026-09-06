import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Loader2, RotateCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/auth-context'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { AuthShell, FormError } from '@/components/auth/AuthShell'
import { OtpInput } from '@/components/auth/OtpInput'
import { Button } from '@/components/ui/button'

/**
 * Rendered dark-on-white deliberately. Inverted QR codes (light modules on a
 * dark ground) fail on a meaningful number of phone scanners, and a broken
 * enrollment is a much worse outcome than a white chip on a dark card.
 */
const QR_OPTIONS = {
  width: 208,
  margin: 1,
  errorCorrectionLevel: 'M',
  color: { dark: '#06070a', light: '#ffffff' },
}

/** `JBSWY3DPEHPK3PXP` → `JBSW Y3DP EHPK 3PXP`, so it can be typed by hand. */
function groupSecret(secret) {
  return secret.replace(/(.{4})/g, '$1 ').trim()
}

export function EnrollStep() {
  const { enrollment, confirmEnrollment, restartEnrollment, busy, error, setError } =
    useAuth()
  const [code, setCode] = useState('')
  // Keyed by the URI it was drawn for, so a new secret shows the loading
  // state without a synchronous reset inside the effect.
  const [qr, setQr] = useState(null)
  const { copied, copy } = useCopyToClipboard()

  const secret = enrollment?.secret ?? ''
  const uri = enrollment?.provisioning_uri ?? ''

  useEffect(() => {
    if (!uri) return undefined
    let alive = true
    QRCode.toDataURL(uri, QR_OPTIONS)
      .then((url) => alive && setQr({ uri, url }))
      .catch(() => alive && setQr({ uri, failed: true }))
    return () => {
      alive = false
    }
  }, [uri])

  const current = qr?.uri === uri ? qr : null

  const submit = async (value = code) => {
    if (value.length !== 6 || busy) return
    const ok = await confirmEnrollment(value)
    if (!ok) setCode('')
  }

  return (
    <AuthShell
      step={1}
      title="Set up your authenticator"
      description="Secryn requires a second factor on every account — a stolen Google session should never be enough to reach your secrets. This takes about thirty seconds."
      footer="Lost your phone later? You will need to re-enroll from a signed-in session."
    >
      {/* Scan target */}
      <div className="flex flex-col items-center gap-5 rounded-lg border border-border bg-ink-925/60 p-5">
        <div className="grid size-[232px] place-items-center rounded-lg bg-white p-3">
          {current?.url ? (
            <img
              src={current.url}
              alt="QR code for setting up two-factor authentication"
              width={208}
              height={208}
              className="size-52"
            />
          ) : current?.failed ? (
            <p className="px-4 text-center text-xs text-ink-950">
              Could not draw the QR code. Use the setup key below instead.
            </p>
          ) : (
            <Loader2 aria-hidden="true" className="size-5 animate-spin text-ink-500" />
          )}
        </div>

        <p className="text-center text-[0.8125rem] leading-relaxed text-ink-400">
          Scan this with Google Authenticator, 1Password, Authy, or any TOTP app.
        </p>

        <div className="w-full">
          <p className="label-mono text-ink-600">Or enter this key manually</p>
          <button
            type="button"
            onClick={() => copy(secret)}
            aria-label={copied ? 'Setup key copied' : 'Copy setup key'}
            className="group mt-2 flex w-full items-center gap-3 rounded-md border border-border bg-ink-950/60 px-3 py-2.5 text-left transition-colors hover:border-border-strong"
          >
            <span className="flex-1 font-mono text-[0.8125rem] break-all text-ink-100">
              {secret ? groupSecret(secret) : '—'}
            </span>
            <span className="shrink-0 text-ink-500 transition-colors group-hover:text-ink-200">
              {copied ? (
                <Check className="size-3.5 text-signal" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Confirm */}
      <form
        className="mt-7"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <label htmlFor="totp" className="label-mono block text-ink-500">
          Enter the 6-digit code
        </label>
        <div className="mt-3">
          <OtpInput
            value={code}
            onChange={(next) => {
              if (error) setError(null)
              setCode(next)
            }}
            onComplete={submit}
            disabled={busy || !secret}
            hasError={Boolean(error)}
            describedBy={error ? 'enroll-error' : undefined}
          />
        </div>

        <FormError id="enroll-error">{error}</FormError>

        <Button
          type="submit"
          size="lg"
          disabled={busy || code.length !== 6}
          className={cn('mt-5 h-11 w-full text-[0.9375rem]')}
        >
          {busy ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Verifying…
            </>
          ) : (
            'Confirm and continue'
          )}
        </Button>
      </form>

      <button
        type="button"
        onClick={restartEnrollment}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 text-xs text-ink-500 transition-colors hover:text-ink-200 disabled:opacity-50"
      >
        <RotateCw aria-hidden="true" className="size-3" />
        Generate a new key
      </button>
    </AuthShell>
  )
}
