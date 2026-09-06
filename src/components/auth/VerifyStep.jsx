import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/hooks/auth-context'
import { AuthShell, FormError } from '@/components/auth/AuthShell'
import { OtpInput } from '@/components/auth/OtpInput'
import { Button } from '@/components/ui/button'

export function VerifyStep() {
  const { email, verifyCode, logout, busy, error, setError } = useAuth()
  const [code, setCode] = useState('')

  const submit = async (value = code) => {
    if (value.length !== 6 || busy) return
    const ok = await verifyCode(value)
    if (!ok) setCode('')
  }

  return (
    <AuthShell
      step={1}
      title="Enter your code"
      description={
        email
          ? `Open your authenticator app and enter the current code for ${email}.`
          : 'Open your authenticator app and enter the current code.'
      }
      footer="Codes rotate every 30 seconds. If one is rejected, wait for the next."
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <label htmlFor="totp" className="label-mono block text-ink-500">
          Authentication code
        </label>
        <div className="mt-3">
          <OtpInput
            value={code}
            onChange={(next) => {
              if (error) setError(null)
              setCode(next)
            }}
            onComplete={submit}
            disabled={busy}
            hasError={Boolean(error)}
            describedBy={error ? 'verify-error' : undefined}
          />
        </div>

        <FormError id="verify-error">{error}</FormError>

        <Button
          type="submit"
          size="lg"
          disabled={busy || code.length !== 6}
          className="mt-5 h-11 w-full text-[0.9375rem]"
        >
          {busy ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Verifying…
            </>
          ) : (
            'Verify and continue'
          )}
        </Button>
      </form>

      <button
        type="button"
        onClick={logout}
        disabled={busy}
        className="mt-5 text-xs text-ink-500 transition-colors hover:text-ink-200 disabled:opacity-50"
      >
        Use a different account
      </button>
    </AuthShell>
  )
}
