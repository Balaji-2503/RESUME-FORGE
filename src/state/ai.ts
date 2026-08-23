import { useCallback, useSyncExternalStore } from 'react'
import { emptyConfig, loadConfig, saveConfig, type AiConfig } from '@/lib/ai/config'

/** Kept out of the résumé store deliberately: the key must never end up in an
 *  exported .json file, an undo entry, or a duplicated résumé. */
let config: AiConfig = typeof localStorage === 'undefined' ? emptyConfig() : loadConfig()
const listeners = new Set<() => void>()

export const aiStore = {
  get: () => config,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  update(patch: Partial<AiConfig>) {
    config = { ...config, ...patch }
    saveConfig(config)
    listeners.forEach((l) => l())
  },
  setKey(key: string) {
    config = { ...config, keys: { ...config.keys, [config.provider]: key } }
    saveConfig(config)
    listeners.forEach((l) => l())
  },
}

export function useAiConfig(): AiConfig {
  return useSyncExternalStore(
    aiStore.subscribe,
    useCallback(() => aiStore.get(), []),
    useCallback(() => aiStore.get(), []),
  )
}
