const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Accepts `2024-03`, `2024-03-01`, `2024`, or free text ("Summer 2024") and
 *  renders something sensible. Free text passes through untouched so users are
 *  never fighting the date field. */
export function formatDate(value: string): string {
  const v = value.trim()
  if (!v) return ''
  const ym = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(v)
  if (ym) {
    const month = Number(ym[2])
    if (month >= 1 && month <= 12) return `${MONTHS[month - 1]} ${ym[1]}`
    return ym[1]
  }
  return v
}

export function dateRange(start: string, end: string, current?: boolean): string {
  const a = formatDate(start)
  const b = current ? 'Present' : formatDate(end)
  if (a && b) return `${a} — ${b}`
  return a || b
}

/** Rough duration label, e.g. "2 yrs 4 mos". Empty when it can't be computed. */
export function duration(start: string, end: string, current?: boolean): string {
  const parse = (v: string) => {
    const m = /^(\d{4})(?:-(\d{1,2}))?/.exec(v.trim())
    if (!m) return null
    return { y: Number(m[1]), m: m[2] ? Number(m[2]) - 1 : 0 }
  }
  const a = parse(start)
  const b = current ? { y: new Date().getFullYear(), m: new Date().getMonth() } : parse(end)
  if (!a || !b) return ''
  let months = (b.y - a.y) * 12 + (b.m - a.m)
  if (months < 0) return ''
  months += 1
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts: string[] = []
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`)
  if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`)
  return parts.join(' ')
}

/** Strips protocol and trailing slash for display; keeps the path. */
export function displayUrl(url: string): string {
  return url.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')
}

export function href(url: string): string {
  const v = url.trim()
  if (!v) return ''
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v
  if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(v)) return `mailto:${v}`
  return `https://${v}`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}
