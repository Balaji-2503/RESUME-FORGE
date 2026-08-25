/** AI assist is opt-in and calls the provider directly from the browser using
 *  the user's own key. That keeps the "no server" promise: no backend of ours
 *  ever sees a résumé. The trade-off — the key lives in this browser's
 *  localStorage — is stated plainly in the UI.
 *
 *  Every provider here speaks the OpenAI /chat/completions shape, so one
 *  transport covers all of them and nobody is locked to one vendor. The only
 *  hard requirement is that the endpoint allows browser-origin requests; Groq's
 *  does (`access-control-allow-origin: *`). */

export type ProviderId = 'groq' | 'compatible'

export interface ModelOption {
  id: string
  /** Shown in the picker — what this one is good for, not just its name. */
  label: string
}

export interface Provider {
  id: ProviderId
  label: string
  /** Where to get a key, shown next to the input. */
  keysUrl: string
  keyHint: string
  defaultModel: string
  models: ModelOption[]
  /** Fixed for hosted providers; editable for 'compatible'. */
  baseUrl: string
  note: string
}

export const PROVIDERS: Provider[] = [
  {
    id: 'groq',
    label: 'Groq',
    keysUrl: 'https://console.groq.com/keys',
    keyHint: 'gsk_…',
    defaultModel: 'openai/gpt-oss-120b',
    // Groq's production text models, best-quality first. Preview models are
    // excluded on purpose (Groq ships them for evaluation only), and so is
    // groq/compound — it browses the web, which has no business seeing a
    // half-written résumé bullet.
    models: [
      { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B — best quality (default)' },
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B — strong alternative' },
      { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B — faster, cheaper' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B — fastest, roughest' },
    ],
    baseUrl: 'https://api.groq.com/openai/v1',
    note: 'Has a free tier. Fast, and enough for rewriting a bullet.',
  },
  {
    id: 'compatible',
    label: 'Other (OpenAI-compatible)',
    keysUrl: '',
    keyHint: 'your key',
    defaultModel: '',
    models: [],
    baseUrl: '',
    note: 'OpenRouter, Together, a local llama.cpp server — anything exposing /chat/completions. It must allow browser requests (CORS).',
  },
]

export const providerById = (id: ProviderId): Provider =>
  PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0]

export interface AiConfig {
  provider: ProviderId
  model: string
  baseUrl: string
  /** Keys are held per provider so switching back and forth doesn't lose them. */
  keys: Partial<Record<ProviderId, string>>
}

const STORAGE = 'resume-forge:ai'

export const emptyConfig = (): AiConfig => ({
  provider: 'groq',
  model: providerById('groq').defaultModel,
  baseUrl: providerById('groq').baseUrl,
  keys: {},
})

export function loadConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (!raw) return emptyConfig()
    const parsed = JSON.parse(raw) as Partial<AiConfig>
    const provider = PROVIDERS.some((p) => p.id === parsed.provider)
      ? (parsed.provider as ProviderId)
      : 'groq'
    const fallback = providerById(provider)
    return {
      provider,
      model: typeof parsed.model === 'string' && parsed.model ? parsed.model : fallback.defaultModel,
      baseUrl: typeof parsed.baseUrl === 'string' && parsed.baseUrl ? parsed.baseUrl : fallback.baseUrl,
      keys: parsed.keys && typeof parsed.keys === 'object' ? parsed.keys : {},
    }
  } catch {
    return emptyConfig()
  }
}

export function saveConfig(config: AiConfig) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(config))
  } catch {
    /* private mode — AI assist stays off for this session */
  }
}

export const activeKey = (config: AiConfig): string => (config.keys[config.provider] ?? '').trim()
export const isReady = (config: AiConfig): boolean => activeKey(config).length > 0 && config.model.trim().length > 0

export function maskKey(key: string): string {
  const k = key.trim()
  return k.length < 12 ? '••••••' : `${k.slice(0, 6)}…${k.slice(-4)}`
}
