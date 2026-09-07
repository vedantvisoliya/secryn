import { KeyRound, Loader2, ShieldCheck } from 'lucide-react'

import { useAuth } from '@/hooks/auth-context'
import { GoogleLogo } from '@/components/shared/GoogleLogo'
import { AuthShell, FormError } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'

const ASSURANCES = [
  { icon: ShieldCheck, text: 'A second factor is required on every account.' },
  { icon: KeyRound, text: 'Your passphrase is never sent to us, or stored.' },
]

export function SignInStep() {
  const { signIn, busy, error } = useAuth()

  return (
    <AuthShell
      step={0}
      title="Sign in to Secryn"
      description="Google handles the sign-in, so there is no Secryn password to phish or leak."
      footer={
        <>
          By continuing you agree to the{' '}
          <a href="/#faq" className="text-ink-400 underline underline-offset-2 hover:text-ink-200">
            terms
          </a>{' '}
          and{' '}
          <a href="/#faq" className="text-ink-400 underline underline-offset-2 hover:text-ink-200">
            privacy policy
          </a>
          .
        </>
      }
    >
      <Button
        type="button"
        size="lg"
        onClick={signIn}
        disabled={busy}
        className="h-12 w-full text-[0.9375rem]"
      >
        {busy ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Opening Google…
          </>
        ) : (
          <>
            <GoogleLogo />
            Continue with Google
          </>
        )}
      </Button>

      <FormError>{error}</FormError>

      <ul className="mt-7 divide-y divide-border border-t border-border">
        {ASSURANCES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 py-3.5">
            <Icon
              aria-hidden="true"
              strokeWidth={1.5}
              className="mt-0.5 size-4 shrink-0 text-ink-500"
            />
            <span className="text-[0.8125rem] leading-relaxed text-ink-400">{text}</span>
          </li>
        ))}
      </ul>
    </AuthShell>
  )
}
