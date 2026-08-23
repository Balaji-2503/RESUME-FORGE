import { Component, type ErrorInfo, type ReactNode } from 'react'
import { download } from '@/state/actions'

interface Props { children: ReactNode }
interface State { error: Error | null }

const STORAGE_KEY = 'resume-forge:v1'

/** A crash in a public app must not cost someone their résumé. The fallback
 *  hands the raw saved data back before offering to clear it. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Resume Forge crashed:', error, info.componentStack)
  }

  private rescue = () => {
    const raw = localStorage.getItem(STORAGE_KEY) ?? '{}'
    download('resume-forge-backup.json', raw)
  }

  private reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex h-full items-center justify-center bg-ink-100 p-6">
        <div className="card max-w-md p-6">
          <h1 className="text-lg font-semibold">Something broke</h1>
          <p className="mt-2 text-sm text-ink-600">
            Resume Forge hit an error it couldn't recover from. Your saved data is still on
            this device — download a copy before doing anything else.
          </p>
          <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-ink-100 p-2 text-[11px] text-ink-700">
            {this.state.error.message}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={this.rescue}>Download my data</button>
            <button className="btn-soft" onClick={() => location.reload()}>Reload</button>
            <button className="btn-danger" onClick={this.reset}>Clear saved data and restart</button>
          </div>
          <p className="muted mt-3 text-[11px]">
            Re-import the downloaded file with the Import button once the app is running again.
          </p>
        </div>
      </div>
    )
  }
}
