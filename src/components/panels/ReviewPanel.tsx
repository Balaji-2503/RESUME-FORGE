import { useMemo } from 'react'
import { AlertTriangle, CheckCircle2, CircleAlert, Lightbulb } from 'lucide-react'
import AiSettings from './AiSettings'
import { TextArea } from '@/components/ui'
import { reviewResume } from '@/lib/analysis'
import { setTargetJob } from '@/state/actions'
import { useResume, useUI } from '@/state/store'
import type { Severity } from '@/lib/analysis'

const TONE: Record<Severity, { icon: typeof AlertTriangle; ring: string; text: string; label: string }> = {
  critical: { icon: CircleAlert, ring: 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', label: 'Fix' },
  warning: { icon: AlertTriangle, ring: 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', label: 'Warning' },
  suggestion: { icon: Lightbulb, ring: 'border-sky-300 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', label: 'Idea' },
  pass: { icon: CheckCircle2, ring: 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', label: 'Good' },
}

export default function ReviewPanel() {
  const resume = useResume()
  const { dark } = useUI()
  const review = useMemo(() => reviewResume(resume), [resume])

  const counts = {
    critical: review.findings.filter((f) => f.severity === 'critical').length,
    warning: review.findings.filter((f) => f.severity === 'warning').length,
    suggestion: review.findings.filter((f) => f.severity === 'suggestion').length,
  }

  return (
    <div className="space-y-3">
      <ScoreCard score={review.score} counts={counts} dark={dark} />

      <AiSettings />

      <div className="card p-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <Stat label="Words" value={review.stats.words} />
          <Stat label="Roles listed" value={review.stats.experienceItems} />
          <Stat label="Bullets" value={review.stats.bullets} />
          <Stat
            label="With numbers"
            value={`${review.stats.quantifiedBullets}/${review.stats.bullets || 0}`}
            tone={review.stats.bullets && review.stats.quantifiedBullets / review.stats.bullets >= 0.35 ? 'good' : 'warn'}
          />
          <Stat
            label="Strong verbs"
            value={`${review.stats.actionVerbBullets}/${review.stats.bullets || 0}`}
            tone={review.stats.bullets && review.stats.actionVerbBullets / review.stats.bullets >= 0.6 ? 'good' : 'warn'}
          />
          <Stat label="Longest bullet" value={`${review.stats.longestBulletWords}w`} tone={review.stats.longestBulletWords > 34 ? 'warn' : 'good'} />
        </div>
      </div>

      <div className="card p-3">
        <TextArea
          label="Target job description"
          value={resume.targetJob}
          onChange={setTargetJob}
          minRows={4}
          placeholder="Paste the job posting here to see which of its terms your résumé already covers…"
          hint="Stays on your device. Only add keywords you can defend in an interview."
        />
        {review.keywords.length ? (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label !mb-0">Keyword coverage</span>
              <span className="text-xs font-semibold tabular-nums">{Math.round(review.keywordCoverage * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
                style={{ width: `${Math.round(review.keywordCoverage * 100)}%` }}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {review.keywords.map((k) => (
                <span
                  key={k.term}
                  title={k.found ? `Appears ${k.count}×` : 'Not found in your résumé'}
                  className={`rounded px-1.5 py-0.5 text-[11px] ${
                    k.found
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-ink-100 text-ink-500 line-through dark:bg-ink-800 dark:text-ink-400'
                  }`}
                >
                  {k.term}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        {review.findings.map((f) => {
          const tone = TONE[f.severity]
          const Icon = tone.icon
          return (
            <div key={f.id} className={`rounded-lg border p-2.5 ${tone.ring}`}>
              <div className="flex items-start gap-2">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.text}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-600 dark:text-ink-300">{f.detail}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="muted px-1 pb-2 text-[11px] leading-relaxed">
        These checks encode common résumé-screening conventions — they are a second pair of eyes,
        not a guarantee about any particular employer's system.
      </p>
    </div>
  )
}

function ScoreCard({
  score, counts, dark,
}: {
  score: number
  counts: { critical: number; warning: number; suggestion: number }
  dark: boolean
}) {
  // Darker on white, lighter on the dark surface — one fixed hue can't clear
  // 4.5:1 against both.
  const hue = dark
    ? score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171'
    : score >= 80 ? '#047857' : score >= 60 ? '#b45309' : '#b91c1c'
  const label = score >= 90 ? 'Excellent' : score >= 80 ? 'Strong' : score >= 60 ? 'Needs work' : 'Needs attention'
  const circumference = 2 * Math.PI * 30

  return (
    <div className="card flex items-center gap-4 p-4">
      <div className="relative h-[76px] w-[76px] shrink-0">
        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
          <circle cx="36" cy="36" r="30" fill="none" strokeWidth="7" className="stroke-ink-200 dark:stroke-ink-800" />
          <circle
            cx="36" cy="36" r="30" fill="none" strokeWidth="7" strokeLinecap="round" stroke={hue}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - score / 100)}
            style={{ transition: 'stroke-dashoffset 500ms ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums">{score}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: hue }}>{label}</p>
        <p className="muted mt-0.5 text-xs">
          {counts.critical} to fix · {counts.warning} warning{counts.warning === 1 ? '' : 's'} · {counts.suggestion} idea{counts.suggestion === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: 'good' | 'warn' }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-ink-100 pb-1.5 dark:border-ink-800">
      <span className="text-ink-500 dark:text-ink-400">{label}</span>
      <span
        className={`font-semibold tabular-nums ${
          tone === 'warn' ? 'text-amber-700 dark:text-amber-400' : tone === 'good' ? 'text-emerald-700 dark:text-emerald-400' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}
