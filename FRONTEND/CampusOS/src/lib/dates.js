/* ============================================================================
   Shared date/time helpers.
   Every page formats dates the same way, so this lives in one place.
   ========================================================================== */

/**
 * Build the date from its parts. `new Date("2026-09-10")` is parsed as UTC
 * midnight, which renders as the previous day in any negative-offset zone —
 * this avoids that off-by-one entirely.
 */
export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const pad = (n) => String(n).padStart(2, '0')

// Local calendar date as "YYYY-MM-DD", to compare against the data's dates.
export function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// "14:00" -> "2:00 PM"
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`
}

export const dayName = (iso) =>
  parseDate(iso).toLocaleDateString(undefined, { weekday: 'long' })

export const monthYear = (iso) =>
  parseDate(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

export const shortDate = (iso) =>
  parseDate(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

/**
 * Whole days from today to `iso` — negative in the past, 0 for today.
 * Rounded so a daylight-saving hour shift can't push a day off by one.
 */
export function daysUntil(iso) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((parseDate(iso) - startOfToday) / 86400000)
}

// "Today" / "Yesterday" / "Tomorrow", or null when it is further away.
export function relativeDay(iso) {
  const diff = daysUntil(iso)
  if (diff === 0) return 'Today'
  if (diff === -1) return 'Yesterday'
  if (diff === 1) return 'Tomorrow'
  return null
}
