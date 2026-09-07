import { decodeReminderDays, toDate } from '@/lib/period-cycle'

/**
 * Lifecycle state of a stored key. These four map onto the same four colours
 * the rest of the product uses for state: jade = sealed, ember = due,
 * red = dead, neutral = archived.
 */
export const KEY_STATUS = {
  SEALED: 'sealed',
  EXPIRING: 'expiring',
  EXPIRED: 'expired',
  DELETED: 'deleted',
}

/** Whole days from today until `date` (negative once it has passed). */
export function daysUntil(date) {
  const target = toDate(date)
  if (!target) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((target - today) / 86_400_000)
}

/**
 * A key counts as "expiring" once it is inside its own reminder window — the
 * same threshold the backend uses to start emailing about it, so the badge and
 * the email agree instead of drifting apart.
 *
 * @param {{is_deleted?: boolean, is_expired?: boolean, expiration_date?: string, period_cycle?: string|number}} key
 */
export function keyStatus(key) {
  if (key?.is_deleted) return KEY_STATUS.DELETED
  if (key?.is_expired) return KEY_STATUS.EXPIRED

  const remaining = daysUntil(key?.expiration_date)
  if (remaining !== null && remaining < 0) return KEY_STATUS.EXPIRED

  const window = decodeReminderDays(key)
  if (remaining !== null && remaining <= window) return KEY_STATUS.EXPIRING

  return KEY_STATUS.SEALED
}

/** "in 88 days" / "in 1 day" / "today" / "12 days ago" */
export function describeExpiry(date) {
  const remaining = daysUntil(date)
  if (remaining === null) return 'no expiry'
  if (remaining === 0) return 'today'
  if (remaining < 0) {
    const past = Math.abs(remaining)
    return past === 1 ? 'yesterday' : `${past} days ago`
  }
  return remaining === 1 ? 'in 1 day' : `in ${remaining} days`
}

/** Short absolute date for tooltips and detail rows. */
export function formatDate(value) {
  const parsed = toDate(value)
  if (!parsed) return '—'
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
