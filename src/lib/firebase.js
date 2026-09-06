import { getApps, initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'

import { GOOGLE_CLIENT_ID, firebaseConfig, missingFirebaseConfig } from '@/lib/config'
import { decodeJwt } from '@/lib/tokens'

/**
 * Firebase is used for exactly one thing: running the Google sign-in dance and
 * handing us a **Google-issued OAuth ID token**. Secryn's own JWTs are the
 * session after that, so Firebase state is kept in memory only — no second
 * source of truth to drift out of sync.
 */
let cachedAuth = null

function getFirebaseAuth() {
  if (cachedAuth) return cachedAuth

  const missing = missingFirebaseConfig()
  if (missing.length > 0) {
    throw new Error(
      `Firebase is not configured. Missing env vars: ${missing
        .map((key) => `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`)
        .join(', ')}`,
    )
  }

  const app = getApps()[0] ?? initializeApp(firebaseConfig)
  cachedAuth = getAuth(app)
  // Fire-and-forget: persistence only affects Firebase's own session, which we
  // do not rely on.
  setPersistence(cachedAuth, inMemoryPersistence).catch(() => {})
  return cachedAuth
}

const FIREBASE_ERRORS = {
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/popup-blocked':
    'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth/unauthorized-domain':
    'This domain is not in the Firebase authorised domains list. Add it under Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed':
    'Google sign-in is not enabled for this Firebase project.',
  'auth/network-request-failed':
    'Network error while talking to Google. Check your connection and try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
}

export function describeFirebaseError(error) {
  return FIREBASE_ERRORS[error?.code] ?? error?.message ?? 'Google sign-in failed.'
}

/** True for the codes that mean "the user backed out", which we don't surface as errors. */
export function isCancelledSignIn(error) {
  return (
    error?.code === 'auth/popup-closed-by-user' ||
    error?.code === 'auth/cancelled-popup-request' ||
    error?.code === 'auth/user-cancelled'
  )
}

/**
 * Run Google sign-in and return the token the Secryn API actually wants.
 *
 * ── Why `credentialFromResult`, not `user.getIdToken()` ───────────────────
 * `POST /api/v1/auth/login` verifies the token against Google using the
 * backend's GOOGLE_CLIENT_ID. Two different tokens exist here:
 *
 *   user.getIdToken()                    → a *Firebase* ID token
 *                                          iss: securetoken.google.com/<project>
 *                                          aud: <firebase-project-id>
 *   credentialFromResult(result).idToken → the *Google* OAuth ID token
 *                                          iss: accounts.google.com
 *                                          aud: <your OAuth client id>
 *
 * Only the second one passes Google's verifier, which is why the backend
 * returns 401 "Unable to verify Google credentials." if you send the first.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * @returns {Promise<{idToken: string, email: string|null, name: string|null, photoURL: string|null}>}
 */
export async function signInWithGoogle() {
  const auth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  provider.setCustomParameters({ prompt: 'select_account' })

  const result = await signInWithPopup(auth, provider)
  const credential = GoogleAuthProvider.credentialFromResult(result)
  const idToken = credential?.idToken

  if (!idToken) {
    throw new Error(
      'Google did not return an ID token. Check that the Firebase Google provider is using your own OAuth client ID and secret.',
    )
  }

  // Catch an audience mismatch here rather than as an opaque 401 from the API.
  if (GOOGLE_CLIENT_ID) {
    const audience = decodeJwt(idToken)?.aud
    if (audience && audience !== GOOGLE_CLIENT_ID) {
      throw new Error(
        `This Google ID token was issued for a different OAuth client (${audience}). It must match the backend's GOOGLE_CLIENT_ID.`,
      )
    }
  }

  return {
    idToken,
    email: result.user?.email ?? null,
    name: result.user?.displayName ?? null,
    photoURL: result.user?.photoURL ?? null,
  }
}

export async function signOutOfFirebase() {
  try {
    await signOut(getFirebaseAuth())
  } catch {
    /* Firebase session is in-memory; failing to clear it is not fatal. */
  }
}
