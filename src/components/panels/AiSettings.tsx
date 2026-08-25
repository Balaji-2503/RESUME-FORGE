import { useEffect, useState } from 'react'
import { ExternalLink, Sparkles } from 'lucide-react'
import { Collapsible, Select, TextField } from '@/components/ui'
import { PROVIDERS, activeKey, isReady, maskKey, providerById, type ProviderId } from '@/lib/ai/config'
import { aiStore, useAiConfig } from '@/state/ai'

export default function AiSettings() {
  const config = useAiConfig()
  const provider = providerById(config.provider)
  const key = activeKey(config)
  const ready = isReady(config)

  // Show the input while the user is entering a key, and keep showing it until
  // they leave the field. Deciding this from `key` being non-empty instead
  // unmounted the input on the first keystroke, so only that one character was
  // ever saved — a typed key silently became "g".
  const [entering, setEntering] = useState(() => key.length === 0)

  // Switching provider swaps in that provider's own key, if it has one.
  useEffect(() => {
    setEntering(activeKey(config).length === 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.provider])

  const switchProvider = (id: ProviderId) => {
    const next = providerById(id)
    aiStore.update({
      provider: id,
      model: next.defaultModel || config.model,
      baseUrl: next.baseUrl || config.baseUrl,
    })
  }

  return (
    <Collapsible
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-ink-400" /> AI assist
        </span>
      }
      subtitle={ready ? `${provider.label} · ${config.model}` : 'Off — add a key to enable'}
      defaultOpen={!ready}
    >
      <div className="space-y-3">
        <p className="muted text-[11px] leading-relaxed">
          Optional. Uses <strong>your own</strong> API key, called straight from this browser — no
          server of ours is involved and your résumé is never uploaded anywhere by this app. When you
          click "Improve", the one bullet you picked (plus its job title) is sent to the provider you
          choose below. The key is stored in this browser only, and never included in résumé exports.
        </p>

        <Select
          label="Provider"
          value={config.provider}
          onChange={switchProvider}
          options={PROVIDERS.map((p) => ({ value: p.id, label: p.label }))}
        />
        <p className="muted text-[11px]">{provider.note}</p>

        {key && !entering ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-ink-200 px-2.5 py-2 dark:border-ink-700">
            <span className="font-mono text-xs">{maskKey(key)}</span>
            <span className="flex gap-1">
              <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={() => setEntering(true)}>
                Replace
              </button>
              <button
                type="button"
                className="btn-danger !px-2 !py-1 text-xs"
                onClick={() => { aiStore.setKey(''); setEntering(true) }}
              >
                Remove
              </button>
            </span>
          </div>
        ) : (
          <div>
            <TextField
              label="API key"
              type="password"
              value={key}
              placeholder={provider.keyHint}
              onChange={(v) => aiStore.setKey(v)}
              onBlur={() => { if (activeKey(aiStore.get())) setEntering(false) }}
            />
            {provider.keysUrl ? (
              <a
                href={provider.keysUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline dark:text-brand-400"
              >
                Get a key <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        )}

        {provider.models.length ? (
          <Select
            label="Model"
            value={config.model}
            onChange={(model) => aiStore.update({ model })}
            options={provider.models.map((m) => ({ value: m.id, label: m.label }))}
          />
        ) : (
          <TextField label="Model" value={config.model} onChange={(model) => aiStore.update({ model })} placeholder="model-id" />
        )}

        {config.provider === 'compatible' ? (
          <TextField
            label="Base URL"
            value={config.baseUrl}
            onChange={(baseUrl) => aiStore.update({ baseUrl })}
            placeholder="https://api.example.com/v1"
            hint="Everything before /chat/completions. Must allow browser requests (CORS)."
          />
        ) : null}
      </div>
    </Collapsible>
  )
}
