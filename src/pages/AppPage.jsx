import { useEffect, useState } from 'react'
import { Loader2, LogOut, RefreshCw, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/auth-context'
import { refreshSession } from '@/lib/api'
import { expiryOf, getAccessToken } from '@/lib/tokens'
import { Frame } from '@/components/shared/Frame'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'

/** Live countdown to the access token's own `exp` claim. */
function useAccessTokenCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(null)

  useEffect(() => {
    const tick = () => {
      const token = getAccessToken()
      const expiresAt = token ? expiryOf(token) : null
      setSecondsLeft(
        expiresAt === null ? null : Math.max(0, Math.round((expiresAt - Date.now()) / 1000)),
      )
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return secondsLeft
}

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-3.5 last:border-b-0">
      <span className="label-mono text-ink-600">{label}</span>
      <span className="font-mono text-[0.8125rem] text-ink-100">{children}</span>
    </div>
  )
}

/**
 * Placeholder for the signed-in vault. It exists to prove the session layer
 * end to end: the token countdown and the manual rotate button exercise the
 * same code path the background scheduler uses.
 */
export default function AppPage() {
  const { user, email, logout, busy } = useAuth()
  const secondsLeft = useAccessTokenCountdown()
  const [rotating, setRotating] = useState(false)
  const [rotateError, setRotateError] = useState(null)

  const rotate = async () => {
    setRotating(true)
    setRotateError(null)
    try {
      await refreshSession()
    } catch (error) {
      setRotateError(error?.message ?? 'Refresh failed.')
    } finally {
      setRotating(false)
    }
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <Frame>
          <div className="flex h-16 items-center justify-between gap-4 px-(--gutter)">
            <Logo />
            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-xs text-ink-400 sm:inline">
                {user?.email ?? email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                disabled={busy}
                className="border-border bg-transparent text-ink-200 hover:border-border-strong hover:bg-ink-900 hover:text-ink-50"
              >
                <LogOut />
                Sign out
              </Button>
            </div>
          </div>
        </Frame>
      </header>

      <main className="border-b border-border">
        <Frame>
          <div className="px-(--gutter) py-(--section-y)">
            <p className="label-mono flex items-center gap-2 text-signal">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              session active
            </p>
            <h1 className="mt-4 text-h2 text-ink-50">
              You’re in{user?.given_name ? `, ${user.given_name}` : ''}.
            </h1>
            <p className="mt-4 max-w-[56ch] text-lead text-ink-300">
              Google sign-in and your second factor both checked out. The vault UI
              lands here next — this screen is the session harness.
            </p>

            <div className="mt-10 max-w-lg rounded-xl border border-border bg-ink-900/50 p-5 sm:p-6">
              <p className="label-mono mb-2 text-ink-500">Session</p>
              <Row label="Account">{user?.email ?? email ?? '—'}</Row>
              <Row label="Second factor">
                <span className={user?.mfa_enabled ? 'text-signal' : 'text-ember'}>
                  {user?.mfa_enabled ? 'enrolled' : 'not enrolled'}
                </span>
              </Row>
              <Row label="Access token expires in">
                <span
                  className={cn(
                    'tabular',
                    secondsLeft !== null && secondsLeft < 60 ? 'text-ember' : 'text-ink-100',
                  )}
                >
                  {secondsLeft === null ? 'unknown' : `${secondsLeft}s`}
                </span>
              </Row>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rotate}
                  disabled={rotating}
                  className="border-border bg-transparent text-ink-200 hover:border-border-strong hover:bg-ink-850 hover:text-ink-50"
                >
                  {rotating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <RefreshCw />
                  )}
                  Rotate now
                </Button>
                <span className="label-mono text-ink-600">
                  auto-rotates 60s before expiry
                </span>
              </div>

              {rotateError ? (
                <p role="alert" className="mt-4 text-[0.8125rem] text-flare">
                  {rotateError}
                </p>
              ) : null}
            </div>
          </div>
        </Frame>
      </main>
    </div>
  )
}
