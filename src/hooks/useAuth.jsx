import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  ApiError,
  SESSION_EXPIRED_EVENT,
  SessionExpiredError,
  authApi,
  refreshSession,
  usersApi,
} from '@/lib/api'
import {
  clearSession,
  getRefreshToken,
  msUntilRefresh,
  readContext,
  saveContext,
  saveTokens,
} from '@/lib/tokens'

/**
 * Firebase is ~50 kB gzipped and only matters once someone actually signs in.
 * Loading it lazily keeps it out of the marketing bundle.
 */
const loadFirebase = () => import('@/lib/firebase')

import { AuthContext, STAGE } from '@/hooks/auth-context'

/**
 * Work out which MFA branch the user is on.
 *
 * `/auth/login` only tells us `mfa_pending: true` — not whether a secret is
 * already enrolled. `/users/me` is authoritative (it carries both
 * `mfa_enabled` and `mfa_pending`), so we ask it first. If the pending-scope
 * token cannot reach that endpoint, we fall back to probing enroll/start.
 */
async function resolveStage(emailHint) {
  try {
    const me = await usersApi.me()
    if (!me.mfa_pending) return { stage: STAGE.AUTHENTICATED, user: me }
    if (me.mfa_enabled) {
      return { stage: STAGE.VERIFY, email: me.email, user: me }
    }
    const enrollment = await authApi.enrollStart()
    return { stage: STAGE.ENROLL, email: me.email, user: me, enrollment }
  } catch (error) {
    if (error instanceof SessionExpiredError) throw error

    try {
      const enrollment = await authApi.enrollStart()
      return { stage: STAGE.ENROLL, email: emailHint, enrollment }
    } catch (enrollError) {
      if (enrollError instanceof SessionExpiredError) throw enrollError
      return { stage: STAGE.VERIFY, email: emailHint }
    }
  }
}

export function AuthProvider({ children }) {
  const [stage, setStage] = useState(STAGE.BOOTING)
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState(() => readContext().email ?? null)
  const [enrollment, setEnrollment] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const refreshTimer = useRef(null)

  const endSession = useCallback((message = null) => {
    clearSession()
    setUser(null)
    setEnrollment(null)
    setStage(STAGE.SIGNED_OUT)
    setError(message)
  }, [])

  /** Apply a TokenPair, then hydrate whatever stage it implies. */
  const applyTokenPair = useCallback(
    async (pair, emailHint) => {
      saveTokens(pair)

      if (!pair.mfa_pending) {
        const me = await usersApi.me().catch(() => null)
        setUser(me)
        setEmail(me?.email ?? emailHint ?? null)
        setEnrollment(null)
        setStage(STAGE.AUTHENTICATED)
        saveContext({ email: me?.email ?? emailHint, stage: 'active' })
        return
      }

      const resolved = await resolveStage(emailHint)
      setUser(resolved.user ?? null)
      setEmail(resolved.email ?? emailHint ?? null)
      setEnrollment(resolved.enrollment ?? null)
      setStage(resolved.stage)
      saveContext({
        email: resolved.email ?? emailHint,
        stage: resolved.stage === STAGE.AUTHENTICATED ? 'active' : 'pending',
        mfaEnrolled: resolved.stage === STAGE.VERIFY,
      })
    },
    [],
  )

  /* ── Boot: restore a session from the refresh cookie ────────────────── */
  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      if (!getRefreshToken()) {
        if (!cancelled) setStage(STAGE.SIGNED_OUT)
        return
      }
      try {
        const resolved = await resolveStage(readContext().email ?? null)
        if (cancelled) return
        setUser(resolved.user ?? null)
        setEmail(resolved.email ?? readContext().email ?? null)
        setEnrollment(resolved.enrollment ?? null)
        setStage(resolved.stage)
      } catch {
        if (!cancelled) endSession()
      }
    }

    restore()
    return () => {
      cancelled = true
    }
  }, [endSession])

  /* ── Proactive rotation, driven by the token's own `exp` ────────────── */
  useEffect(() => {
    if (stage === STAGE.BOOTING || stage === STAGE.SIGNED_OUT) return undefined

    let cancelled = false

    const schedule = () => {
      window.clearTimeout(refreshTimer.current)
      refreshTimer.current = window.setTimeout(async () => {
        if (cancelled) return
        try {
          await refreshSession()
          if (!cancelled) schedule()
        } catch {
          /* session-expired event handles the terminal case */
        }
      }, msUntilRefresh())
    }

    schedule()

    // A sleeping tab misses its timer; re-check whenever it comes back.
    const onVisible = () => {
      if (document.visibilityState === 'visible') schedule()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      window.clearTimeout(refreshTimer.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [stage])

  /* ── Global session death (revoked elsewhere, refresh rejected) ─────── */
  useEffect(() => {
    const onExpired = () =>
      endSession('Your session expired. Please sign in again.')
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [endSession])

  /* ── Actions ────────────────────────────────────────────────────────── */

  const signIn = useCallback(async () => {
    setError(null)
    setBusy(true)
    let firebase = null
    try {
      firebase = await loadFirebase()
      const google = await firebase.signInWithGoogle()
      setEmail(google.email)
      const pair = await authApi.login(google.idToken)
      await applyTokenPair(pair, google.email)
    } catch (caught) {
      if (firebase?.isCancelledSignIn(caught)) {
        setError(null)
      } else if (caught instanceof ApiError || caught instanceof SessionExpiredError) {
        setError(caught.message)
      } else if (caught?.name === 'NetworkError') {
        setError('Could not reach the Secryn API. Check your connection and try again.')
      } else {
        setError(
          firebase ? firebase.describeFirebaseError(caught) : (caught?.message ?? 'Sign-in failed.'),
        )
      }
    } finally {
      setBusy(false)
    }
  }, [applyTokenPair])

  const confirmEnrollment = useCallback(
    async (code) => {
      if (!enrollment?.secret) {
        setError('Your enrollment session expired. Start again.')
        return false
      }
      setError(null)
      setBusy(true)
      try {
        const pair = await authApi.enrollConfirm({ code, secret: enrollment.secret })
        await applyTokenPair(pair, email)
        return true
      } catch (caught) {
        setError(
          caught instanceof ApiError && caught.status === 400
            ? 'That code was not accepted. Check your authenticator and try again.'
            : (caught?.message ?? 'Could not confirm the code.'),
        )
        return false
      } finally {
        setBusy(false)
      }
    },
    [applyTokenPair, email, enrollment],
  )

  /** Re-stage a fresh secret when an enrollment session goes stale. */
  const restartEnrollment = useCallback(async () => {
    setError(null)
    setBusy(true)
    try {
      setEnrollment(await authApi.enrollStart())
    } catch (caught) {
      setError(caught?.message ?? 'Could not start MFA enrollment.')
    } finally {
      setBusy(false)
    }
  }, [])

  const verifyCode = useCallback(
    async (code) => {
      if (!email) {
        setError('We lost track of your account. Sign in again.')
        endSession()
        return false
      }
      setError(null)
      setBusy(true)
      try {
        const pair = await authApi.verifyMfa({ email, code })
        await applyTokenPair(pair, email)
        return true
      } catch (caught) {
        setError(
          caught instanceof ApiError && (caught.status === 401 || caught.status === 400)
            ? 'That code was not accepted. Codes rotate every 30 seconds — try the current one.'
            : (caught?.message ?? 'Could not verify the code.'),
        )
        return false
      } finally {
        setBusy(false)
      }
    },
    [applyTokenPair, email, endSession],
  )

  const logout = useCallback(async () => {
    setBusy(true)
    try {
      // Best effort: revoke server-side, but always clear locally.
      await authApi.logout(getRefreshToken())
    } catch {
      /* ignore — local logout below is what the user sees */
    } finally {
      await loadFirebase()
        .then((firebase) => firebase.signOutOfFirebase())
        .catch(() => {})
      endSession()
      setBusy(false)
    }
  }, [endSession])

  const value = useMemo(
    () => ({
      stage,
      user,
      email,
      enrollment,
      error,
      busy,
      setError,
      signIn,
      confirmEnrollment,
      restartEnrollment,
      verifyCode,
      logout,
      isAuthenticated: stage === STAGE.AUTHENTICATED,
    }),
    [
      stage,
      user,
      email,
      enrollment,
      error,
      busy,
      signIn,
      confirmEnrollment,
      restartEnrollment,
      verifyCode,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
