/**
 * Runtime configuration, read from Vite env vars.
 *
 * Every value here must be present at build time on Vercel. Firebase web
 * config values are not secrets (they identify the project, they don't
 * authorise anything), but they still have to be set per environment.
 */

const env = import.meta.env

/**
 * Empty in dev so requests go to `/api/...` on Vite's own origin and get
 * proxied (see vite.config.js) — the backend's CORS allowlist rejects
 * localhost. In production the deployed origin is allowed, so we call it
 * directly. An explicit VITE_API_BASE_URL always wins.
 */
const explicitBase = env.VITE_API_BASE_URL?.trim()

export const API_BASE_URL = explicitBase
  ? explicitBase.replace(/\/+$/, '')
  : env.DEV
    ? ''
    : 'https://api-key-lister.fastapicloud.dev'

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

/**
 * The Google OAuth client id the backend validates ID tokens against
 * (its GOOGLE_CLIENT_ID). Optional, but when it is set we can catch an
 * audience mismatch in the browser instead of guessing at a 401.
 */
export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID ?? null

/** Required keys — surfaced as one actionable error rather than a null deref. */
export function missingFirebaseConfig() {
  return ['apiKey', 'authDomain', 'projectId', 'appId'].filter(
    (key) => !firebaseConfig[key],
  )
}
