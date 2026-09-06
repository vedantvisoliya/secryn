/**
 * Token storage.
 *
 * ── Security note, read before changing this ──────────────────────────────
 * The API returns `access_token` / `refresh_token` in the JSON body (there is
 * no `Set-Cookie` on any auth endpoint), and `POST /api/v1/auth/refresh`
 * expects the refresh token in the *request body*. That means the refresh
 * token has to be readable by JavaScript, so `httpOnly` is impossible in a
 * pure SPA — there is no server of ours in the request path to set it.
 *
 * Cookies are still used rather than localStorage because they give us
 * `Secure` + `SameSite=Strict` + an enforced expiry, and they are not exposed
 * to code that only reads Web Storage. But be clear-eyed: a successful XSS on
 * this origin can read these cookies. Closing that hole needs a
 * backend-for-frontend (a Vercel serverless route that holds the refresh
 * token in an httpOnly cookie and proxies /auth/refresh). See README.
 * ─────────────────────────────────────────────────────────────────────────
 */

const ACCESS_COOKIE = 'secryn_at'
const REFRESH_COOKIE = 'secryn_rt'
const CONTEXT_KEY = 'secryn.session_context'

/** Fallback lifetimes, only used when a token carries no readable `exp`. */
const FALLBACK_ACCESS_MS = 15 * 60 * 1000
const FALLBACK_REFRESH_MS = 30 * 24 * 60 * 60 * 1000

/** Refresh this far ahead of expiry, to absorb latency and clock drift. */
export const REFRESH_SKEW_MS = 60 * 1000

/**
 * Decode a JWT payload without verifying it. Verification is the server's job;
 * we only read `exp` so we know when to rotate.
 *
 * @param {string} token
 * @returns {Record<string, unknown> | null}
 */
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Absolute expiry of a token in epoch ms, taken from its own `exp` claim.
 * The claim is authoritative — never assume a fixed 15-minute policy.
 *
 * @returns {number | null} null when the token carries no usable `exp`
 */
export function expiryOf(token) {
  const claims = decodeJwt(token)
  if (!claims || typeof claims.exp !== 'number') return null
  return claims.exp * 1000
}

function writeCookie(name, value, expiresAt) {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'path=/',
    'SameSite=Strict',
    `expires=${new Date(expiresAt).toUTCString()}`,
  ]
  if (window.location.protocol === 'https:') attrs.push('Secure')
  document.cookie = attrs.join('; ')
}

function readCookie(name) {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
  )
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

/**
 * Persist a token pair. Cookie lifetimes follow each token's own `exp`.
 * @param {{access_token: string, refresh_token: string}} pair
 */
export function saveTokens(pair) {
  const now = Date.now()
  writeCookie(
    ACCESS_COOKIE,
    pair.access_token,
    expiryOf(pair.access_token) ?? now + FALLBACK_ACCESS_MS,
  )
  writeCookie(
    REFRESH_COOKIE,
    pair.refresh_token,
    expiryOf(pair.refresh_token) ?? now + FALLBACK_REFRESH_MS,
  )
}

export function getAccessToken() {
  return readCookie(ACCESS_COOKIE)
}

export function getRefreshToken() {
  return readCookie(REFRESH_COOKIE)
}

export function clearTokens() {
  deleteCookie(ACCESS_COOKIE)
  deleteCookie(REFRESH_COOKIE)
}

/** True when the access token is absent or within the refresh window. */
export function accessTokenIsStale() {
  const token = getAccessToken()
  if (!token) return true
  const expiresAt = expiryOf(token)
  if (expiresAt === null) return false
  return Date.now() >= expiresAt - REFRESH_SKEW_MS
}

/** Milliseconds until the access token should be proactively rotated. */
export function msUntilRefresh() {
  const token = getAccessToken()
  if (!token) return 0
  const expiresAt = expiryOf(token)
  if (expiresAt === null) return FALLBACK_ACCESS_MS - REFRESH_SKEW_MS
  return Math.max(0, expiresAt - REFRESH_SKEW_MS - Date.now())
}

/**
 * Non-secret session context (email, which MFA branch we were on). Kept in
 * localStorage deliberately: it is UI state, not a credential, and it lets a
 * reloaded tab resume mid-enrollment without an extra round trip.
 *
 * @typedef {{email?: string, stage?: 'pending'|'active', mfaEnrolled?: boolean}} SessionContext
 */
export function saveContext(patch) {
  try {
    const next = { ...readContext(), ...patch }
    window.localStorage.setItem(CONTEXT_KEY, JSON.stringify(next))
  } catch {
    /* private mode / storage disabled — the flow still works, just no resume */
  }
}

/** @returns {SessionContext} */
export function readContext() {
  try {
    return JSON.parse(window.localStorage.getItem(CONTEXT_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function clearContext() {
  try {
    window.localStorage.removeItem(CONTEXT_KEY)
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  clearTokens()
  clearContext()
}
