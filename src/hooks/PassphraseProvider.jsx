import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AUTO_LOCK_MS, PassphraseContext } from '@/hooks/passphrase-context'

/**
 * The vault passphrase, held in memory for the length of a session.
 *
 * It is never written to a cookie, localStorage, sessionStorage, or the URL —
 * it exists only in this component's state. A refresh, a closed tab, a
 * sign-out, or the inactivity timer all drop it, and any revealed plaintext
 * goes with it.
 *
 * This is the deliberate middle ground: retyping a passphrase for every reveal
 * is hostile, and persisting it anywhere would defeat the point of the product.
 */
export function PassphraseProvider({ children }) {
  const [passphrase, setPassphrase] = useState(null)
  const [lockedAt, setLockedAt] = useState(0)
  const [expiresAt, setExpiresAt] = useState(null)
  const timer = useRef(null)

  const lock = useCallback(() => {
    window.clearTimeout(timer.current)
    setPassphrase(null)
    setExpiresAt(null)
    // Monotonic counter — consumers key off it to drop revealed plaintext.
    setLockedAt((current) => current + 1)
  }, [])

  /** Restart the inactivity countdown. Called on every successful use. */
  const touch = useCallback(() => {
    setExpiresAt((current) => (current === null ? current : Date.now() + AUTO_LOCK_MS))
  }, [])

  const unlock = useCallback((value) => {
    setPassphrase(value)
    setExpiresAt(Date.now() + AUTO_LOCK_MS)
  }, [])

  // Single timer, rescheduled whenever the deadline moves.
  useEffect(() => {
    window.clearTimeout(timer.current)
    if (expiresAt === null) return undefined
    timer.current = window.setTimeout(lock, Math.max(0, expiresAt - Date.now()))
    return () => window.clearTimeout(timer.current)
  }, [expiresAt, lock])

  // Belt and braces: drop it if the tab is being torn down.
  useEffect(() => {
    const drop = () => setPassphrase(null)
    window.addEventListener('pagehide', drop)
    return () => window.removeEventListener('pagehide', drop)
  }, [])

  const value = useMemo(
    () => ({
      passphrase,
      isUnlocked: typeof passphrase === 'string' && passphrase.length > 0,
      expiresAt,
      lockedAt,
      unlock,
      lock,
      touch,
    }),
    [passphrase, expiresAt, lockedAt, unlock, lock, touch],
  )

  return (
    <PassphraseContext.Provider value={value}>{children}</PassphraseContext.Provider>
  )
}
