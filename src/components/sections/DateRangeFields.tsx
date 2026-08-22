import { TextField, Toggle } from '@/components/ui'

export default function DateRangeFields({
  start, end, current, onStart, onEnd, onCurrent, currentLabel = 'I currently work here',
}: {
  start: string
  end: string
  current?: boolean
  onStart: (v: string) => void
  onEnd: (v: string) => void
  onCurrent?: (v: boolean) => void
  currentLabel?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Start" value={start} onChange={onStart} placeholder="2022-03" />
        <TextField
          label={current ? 'End' : 'End'}
          value={current ? '' : end}
          onChange={onEnd}
          placeholder={current ? 'Present' : '2024-08'}
        />
      </div>
      {onCurrent ? <Toggle label={currentLabel} checked={Boolean(current)} onChange={onCurrent} /> : null}
    </div>
  )
}
