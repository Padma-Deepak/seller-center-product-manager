// Dates are formatted in UTC so the day never shifts with the viewer's timezone.
export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

export const formatPrice = (n) => (n == null ? '-' : `$${n.toLocaleString('en-US')}`)

// Counts use "." as the thousands separator, e.g. 13.327
export const formatCount = (n) => (n ?? 0).toLocaleString('de-DE')
