/**
 * Expiry and the reminder gap.
 *
 * ── What the API wants ────────────────────────────────────────────────────
 * Both `expiration_date` and `period_cycle` are `date-time` strings:
 *
 *   expiration_date  "2026-04-23T23:59:59Z"
 *   period_cycle     "2026-04-23T06:00:00Z"
 *
 * The user-facing concept is still "remind me every N days". A datetime can't
 * hold a duration, so N is stored as the *moment reminders should begin* —
 * `expiration_date` minus N days — and read back as the gap between the two.
 * That is the only reading of a datetime field that survives a round trip.
 *
 * NOTE: this is an interpretation of an ambiguous field, not something the
 * schema states. If the backend's reminder job reads `period_cycle`
 * differently, only this file changes.
 * ─────────────────────────────────────────────────────────────────────────
 */

const DAY_MS = 86_400_000

export const MIN_REMINDER_DAYS = 1
export const MAX_REMINDER_DAYS = 365
export const DEFAULT_REMINDER_DAYS = 7

/** Accepts `YYYY-MM-DD` or a full ISO datetime. */
export function toDate(value) {
  if (!value) return null
  const parsed = new Date(String(value).length <= 10 ? `${value}T00:00:00Z` : value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** `<input type="date">` wants `YYYY-MM-DD`, whatever the API returned. */
export function toDateInputValue(value) {
  const date = toDate(value)
  return date ? date.toISOString().slice(0, 10) : ''
}

/** `YYYY-MM-DD` from the date input → end of that day, UTC, as the API expects. */
function encodeExpiration(dateInputValue) {
  if (!dateInputValue) return null
  return `${dateInputValue}T23:59:59Z`
}

function clampDays(days) {
  const parsed = Math.round(Number(days))
  if (!Number.isFinite(parsed)) return DEFAULT_REMINDER_DAYS
  return Math.max(MIN_REMINDER_DAYS, Math.min(MAX_REMINDER_DAYS, parsed))
}

function iso(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/**
 * Both datetimes at once, derived from the same instant.
 *
 * They must be produced together: the reminder is measured back from the
 * *encoded* expiry (end of day), so computing one from the raw date input and
 * the other from the encoded value would make the round trip off by a day.
 *
 * @param {string} dateInputValue `YYYY-MM-DD` from the date field
 * @param {number|string} days reminder gap
 * @returns {{expiration_date: string, period_cycle: string}}
 */
export function encodeSchedule(dateInputValue, days) {
  const expiration = encodeExpiration(dateInputValue)
  const expiry = toDate(expiration) ?? new Date()
  return {
    expiration_date: expiration,
    period_cycle: iso(new Date(expiry.getTime() - clampDays(days) * DAY_MS)),
  }
}

/**
 * The gap between `period_cycle` and `expiration_date`, in whole days.
 * @param {{period_cycle?: string, expiration_date?: string}} apiKey
 */
export function decodeReminderDays(apiKey) {
  const cycle = toDate(apiKey?.period_cycle)
  const expiry = toDate(apiKey?.expiration_date)
  if (!cycle || !expiry) return DEFAULT_REMINDER_DAYS
  const days = Math.round((expiry.getTime() - cycle.getTime()) / DAY_MS)
  return days >= MIN_REMINDER_DAYS ? Math.min(days, MAX_REMINDER_DAYS) : MIN_REMINDER_DAYS
}

/** "every 7 days" / "every day" */
export function describeReminder(apiKey) {
  const days = decodeReminderDays(apiKey)
  return days === 1 ? 'every day' : `every ${days} days`
}
