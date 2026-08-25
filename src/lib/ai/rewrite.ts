import { activeKey, type AiConfig } from './config'
import { plainText } from '@/lib/richtext'

export interface RewriteVariant {
  text: string
  note: string
}

export interface RewriteResult {
  variants: RewriteVariant[]
  /** Questions to the candidate — the metrics that would make the bullet land.
   *  The model is forbidden from inventing these itself. */
  missing: string[]
}

export interface RewriteContext {
  bullet: string
  role?: string
  company?: string
}

/** The one rule that matters. Every AI résumé tool quietly invents metrics,
 *  and a fabricated number is a fabricated credential — the candidate gets
 *  caught defending a figure they have never seen. So the model may only
 *  restate what it was given, and must *ask* for anything it wishes it had. */
const SYSTEM = `You rewrite a single résumé bullet point.

ABSOLUTE RULE — never introduce a fact that is not in the input. No invented
numbers, percentages, money, team sizes, dates, tools, companies or outcomes.
If the bullet has no measurable result, do NOT supply one: instead add a short
question to "missing" asking the candidate for the figure. Inventing a metric
would put a lie on someone's résumé.

Within that rule, make each variant:
- open with a strong past-tense verb (Built, Led, Cut, Migrated, Shipped)
- put the outcome before the method where both are known
- drop filler ("responsible for", "helped with", "team player")
- use no first-person pronouns
- stay under 32 words, one sentence where possible

Return 2-3 variants that differ in emphasis, not just wording. If the input is
already strong, say so in the note rather than padding it.

Reply with JSON only, no markdown fence, in exactly this shape:
{"variants":[{"text":"...","note":"why this is stronger, max 12 words"}],
 "missing":["short question asking for a specific missing metric"]}
"missing" may be an empty array. Never put a question inside "text".`

function buildUserMessage(ctx: RewriteContext): string {
  const lines: string[] = []
  if (ctx.role?.trim() || ctx.company?.trim()) {
    lines.push(`Role: ${[ctx.role, ctx.company].filter((s) => s?.trim()).join(' at ')}`)
  }
  lines.push(`Bullet: ${plainText(ctx.bullet).trim()}`)
  return lines.join('\n')
}

/** Walks the string and returns every balanced `{...}` span, ignoring braces
 *  that appear inside JSON strings. */
function* candidateObjects(text: string): Generator<string> {
  for (let start = text.indexOf('{'); start !== -1; start = text.indexOf('{', start + 1)) {
    let depth = 0
    let inString = false
    let escaped = false
    for (let i = start; i < text.length; i++) {
      const c = text[i]
      if (escaped) { escaped = false; continue }
      if (c === '\\') { escaped = true; continue }
      if (c === '"') { inString = !inString; continue }
      if (inString) continue
      if (c === '{') depth++
      else if (c === '}') {
        depth--
        if (depth === 0) { yield text.slice(start, i + 1); break }
      }
    }
  }
}

/** Models wrap JSON in fences, add a preamble, or — for reasoning models —
 *  emit their thinking first, which can itself contain braces. So rather than
 *  assuming the first `{` and last `}` bound the answer, try each balanced
 *  object and take the first that parses and actually looks like our shape. */
function extractJson(raw: string): unknown {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()

  try {
    const direct = JSON.parse(text)
    if (direct && typeof direct === 'object') return direct
  } catch {
    /* fall through to scanning */
  }

  let firstParsed: unknown
  for (const candidate of candidateObjects(text)) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object') {
        if ('variants' in (parsed as Record<string, unknown>)) return parsed
        if (firstParsed === undefined) firstParsed = parsed
      }
    } catch {
      /* not this one */
    }
  }
  if (firstParsed !== undefined) return firstParsed
  throw new Error('The model did not return JSON.')
}

/** Hand-rolled, matching lib/schema.ts — the project validates untrusted JSON
 *  without a schema library, and one small shape does not justify adding one. */
function toResult(value: unknown): RewriteResult {
  const v = (value ?? {}) as Record<string, unknown>
  const rawVariants = Array.isArray(v.variants) ? v.variants : []
  const variants: RewriteVariant[] = rawVariants
    .map((entry) => {
      const e = (entry ?? {}) as Record<string, unknown>
      return {
        text: typeof e.text === 'string' ? e.text.trim() : '',
        note: typeof e.note === 'string' ? e.note.trim() : '',
      }
    })
    .filter((x) => x.text.length > 0)
    .slice(0, 3)

  const missing = (Array.isArray(v.missing) ? v.missing : [])
    .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    .map((q) => q.trim())
    .slice(0, 3)

  if (!variants.length && !missing.length) throw new Error('The model returned nothing usable.')
  return { variants, missing }
}

function friendlyError(status: number, body: string): string {
  if (status === 401 || status === 403) return 'That key was rejected. Check it in AI assist settings.'
  if (status === 404) return 'That model name was not found for this provider.'
  if (status === 429) return 'Rate limited by the provider. Wait a moment and try again.'
  if (status >= 500) return 'The provider had an error. Try again shortly.'
  const detail = body.slice(0, 160).replace(/\s+/g, ' ').trim()
  return detail ? `Request failed (${status}): ${detail}` : `Request failed (${status}).`
}

/**
 * One /chat/completions call. Works against Groq and any other endpoint
 * speaking the same shape. `signal` lets the UI cancel an in-flight request.
 */
export async function rewriteBullet(
  config: AiConfig,
  ctx: RewriteContext,
  signal?: AbortSignal,
): Promise<RewriteResult> {
  const key = activeKey(config)
  if (!key) throw new Error('Add an API key in AI assist settings first.')
  if (!ctx.bullet.trim()) throw new Error('Nothing to rewrite yet.')

  const base = config.baseUrl.replace(/\/$/, '')
  let response: Response
  try {
    response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.6,
        max_tokens: 1600,
        // Honoured by Groq and most compatible endpoints; extractJson covers
        // the ones that ignore it.
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: buildUserMessage(ctx) },
        ],
      }),
    })
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error
    throw new Error(
      'Could not reach the provider. Check the base URL, your connection, and that the endpoint allows browser requests.',
    )
  }

  if (!response.ok) throw new Error(friendlyError(response.status, await response.text().catch(() => '')))

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error('The model returned an empty response.')

  return toResult(extractJson(content))
}
