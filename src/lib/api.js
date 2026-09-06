import { API_BASE_URL } from '@/lib/config'
import {
  accessTokenIsStale,
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '@/lib/tokens'

/** A non-2xx response from the API. */
export class ApiError extends Error {
  constructor(status, message, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

/** The request never reached the API (offline, DNS, CORS, cold start). */
export class NetworkError extends Error {
  constructor(cause) {
    // fetch() rejects identically for a dead network and a CORS block, so
    // name both rather than sending people to check their wifi.
    super(
      'Could not reach the Secryn API. It is offline, or this origin is not in its allowed list.',
    )
    this.name = 'NetworkError'
    this.cause = cause
  }
}

/** The refresh token is gone, expired, or already rotated. Full re-login. */
export class SessionExpiredError extends Error {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}

/** Fired when the session dies mid-flight so the app can bounce to /login. */
export const SESSION_EXPIRED_EVENT = 'secryn:session-expired'

function emitSessionExpired() {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
}

/** FastAPI returns `detail` as either a string or a list of validation errors. */
function describeDetail(payload, fallback) {
  const detail = payload?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join('. ')
  }
  return fallback
}

async function parseBody(response) {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { detail: text }
  }
}

/**
 * Single-flight refresh.
 *
 * The backend rotates the refresh token on every call and revokes the old one,
 * so two concurrent refreshes would race and invalidate each other. Every
 * caller shares one in-flight promise instead.
 * @type {Promise<void> | null}
 */
let refreshInFlight = null

export function refreshSession() {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new SessionExpiredError()

    let response
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    } catch (cause) {
      // A network blip is not a dead session — keep the tokens and let the
      // caller surface a retryable error.
      throw new NetworkError(cause)
    }

    const payload = await parseBody(response)
    if (!response.ok) {
      clearSession()
      throw new SessionExpiredError(
        describeDetail(payload, 'Your session has expired. Please sign in again.'),
      )
    }
    saveTokens(payload)
  })()

  return refreshInFlight.finally(() => {
    refreshInFlight = null
  })
}

/** Rotate ahead of expiry so authenticated calls never race the clock. */
async function ensureFreshAccessToken() {
  if (!accessTokenIsStale()) return
  await refreshSession()
}

/**
 * @param {string} path
 * @param {{method?: string, body?: unknown, auth?: boolean, signal?: AbortSignal}} options
 */
export async function request(path, options = {}) {
  const { method = 'GET', body, auth = true, signal } = options

  const send = async () => {
    const headers = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (auth) {
      const token = getAccessToken()
      if (token) headers.Authorization = `Bearer ${token}`
    }

    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        signal,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch (cause) {
      if (cause?.name === 'AbortError') throw cause
      throw new NetworkError(cause)
    }
  }

  if (auth) {
    try {
      await ensureFreshAccessToken()
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        emitSessionExpired()
      }
      throw error
    }
  }

  let response = await send()

  // Reactive path: the token died early (clock drift, sleeping tab, revoked
  // elsewhere). Try exactly one refresh-and-replay, never a loop.
  if (response.status === 401 && auth) {
    try {
      await refreshSession()
    } catch (error) {
      if (error instanceof SessionExpiredError) emitSessionExpired()
      throw error
    }
    response = await send()
  }

  const payload = await parseBody(response)

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearSession()
      emitSessionExpired()
      throw new SessionExpiredError(
        describeDetail(payload, 'Your session has expired. Please sign in again.'),
      )
    }
    throw new ApiError(
      response.status,
      describeDetail(payload, `Request failed (${response.status}).`),
      payload,
    )
  }

  return payload
}

/* ── Auth endpoints ─────────────────────────────────────────────────────── */

export const authApi = {
  /**
   * Exchange a **Google** ID token for a Secryn token pair.
   * Not a Firebase ID token — see lib/firebase.js for why.
   * @returns {Promise<{access_token: string, refresh_token: string, mfa_pending: boolean}>}
   */
  login: (idToken) =>
    request('/api/v1/auth/login', {
      method: 'POST',
      auth: false,
      body: { id_token: idToken },
    }),

  /** @returns {Promise<{secret: string, provisioning_uri: string}>} */
  enrollStart: () =>
    request('/api/v1/auth/mfa/enroll/start', { method: 'POST' }),

  enrollConfirm: ({ code, secret }) =>
    request('/api/v1/auth/mfa/enroll/confirm', {
      method: 'POST',
      body: { code, secret },
    }),

  /** Unauthenticated by design: keyed on email + code, not a bearer token. */
  verifyMfa: ({ email, code }) =>
    request('/api/v1/auth/mfa/verify', {
      method: 'POST',
      auth: false,
      body: { email, code },
    }),

  logout: (refreshToken) =>
    request('/api/v1/auth/logout', {
      method: 'POST',
      body: { refresh_token: refreshToken ?? null },
    }),
}

export const usersApi = {
  /** @returns {Promise<{email: string, name: string, mfa_enabled: boolean, mfa_pending: boolean}>} */
  me: () => request('/api/v1/users/me'),
}

export const systemApi = {
  health: () => request('/health', { auth: false }),
}
