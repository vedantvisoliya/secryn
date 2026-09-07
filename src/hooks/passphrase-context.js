import { createContext, useContext } from 'react'

/** Inactivity before the vault re-locks itself. */
export const AUTO_LOCK_MS = 5 * 60 * 1000

export const PassphraseContext = createContext(null)

export function usePassphrase() {
  const context = useContext(PassphraseContext)
  if (!context) {
    throw new Error('usePassphrase must be used inside <PassphraseProvider>')
  }
  return context
}
