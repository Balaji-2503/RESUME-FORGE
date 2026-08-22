/** Short, collision-resistant ids. crypto.randomUUID is available in every
 *  browser we target, but keep a fallback so the module is safe in tests. */
export function uid(prefix = ''): string {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
  return prefix ? `${prefix}_${raw}` : raw
}
