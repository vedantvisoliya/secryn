import { createContext, useContext } from 'react'

/**
 * Auth stages.
 *
 *   booting        restoring a session from the refresh cookie
 *   signed_out     no session; show Google sign-in
 *   enroll         signed in, MFA enrollment is mandatory and not done
 *   verify         signed in, MFA enrolled, second factor required
 *   authenticated  fully scoped session
 */
export const STAGE = {
  BOOTING: 'booting',
  SIGNED_OUT: 'signed_out',
  ENROLL: 'enroll',
  VERIFY: 'verify',
  AUTHENTICATED: 'authenticated',
}

export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
