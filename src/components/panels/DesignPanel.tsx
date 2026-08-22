import { Check } from 'lucide-react'
import { ColorField, Collapsible, Select, Slider, Toggle } from '@/components/ui'
import { FONTS } from '@/lib/fonts'
import { DEFAULT_THEME } from '@/lib/factory'
import { TEMPLATES } from '@/templates'
import { setTheme } from '@/state/actions'
import { useResume } from '@/state/store'
import type { Theme } from '@/lib/types'

const ACCENTS = [
  '#1d45f5', '#0f766e', '#b91c1c', '#7c3aed', '#c2410c',
  '#0369a1', '#4d7c0f', '#9d174d', '#334155', '#111827',
]

const fontOptions = FONTS.map((f) => ({ value: f.id, label: f.label }))

export default function DesignPanel() {
  const { theme } = useResume()

  return (
    <div className="space-y-3">
      <Collapsible title="Template" subtitle={TEMPLATES.find((t) => t.id === theme.template)?.name} defaultOpen>
        <div className="grid gap-1.5">
          {TEMPLATES.map((t) => {
            const active = t.id === theme.template
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme({ template: t.id, ...t.suggests })}
                className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition ${
                  active
                    ? 'border-brand-500 bg-brand-50/70 dark:border-brand-500 dark:bg-brand-950/40'
                    : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800/50'
                }`}
              >
                <TemplateThumb id={t.id} accent={theme.accent} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    {t.name}
                    {active ? <Check className="h-3.5 w-3.5 text-brand-600" /> : null}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-500 dark:text-ink-400">{t.blurb}</span>
                </span>
              </button>
            )
          })}
        </div>
      </Collapsible>

      <Collapsible title="Colour" defaultOpen>
        <div className="space-y-3">
          <ColorField label="Accent" value={theme.accent} onChange={(accent) => setTheme({ accent })} swatches={ACCENTS} />
          <ColorField label="Body text" value={theme.text} onChange={(text) => setTheme({ text })} swatches={['#1a1d24', '#000000', '#2f3542', '#333333']} />
        </div>
      </Collapsible>

      <Collapsible title="Typography" defaultOpen>
        <div className="space-y-3">
          <Select label="Heading font" value={theme.headingFont} onChange={(headingFont) => setTheme({ headingFont })} options={fontOptions} />
          <Select label="Body font" value={theme.bodyFont} onChange={(bodyFont) => setTheme({ bodyFont })} options={fontOptions} />
          <Slider label="Font size" unit="pt" min={8} max={13} step={0.25} value={theme.fontSize} onChange={(fontSize) => setTheme({ fontSize })} />
          <Slider label="Line height" min={1} max={1.9} step={0.02} value={theme.lineHeight} onChange={(lineHeight) => setTheme({ lineHeight })} />
        </div>
      </Collapsible>

      <Collapsible title="Layout" defaultOpen>
        <div className="space-y-3">
          <Select
            label="Paper size"
            value={theme.paper}
            onChange={(paper) => setTheme({ paper })}
            options={[{ value: 'a4' as const, label: 'A4 (210 × 297 mm)' }, { value: 'letter' as const, label: 'US Letter (8.5 × 11 in)' }]}
          />
          <Slider label="Page margin" unit="mm" min={8} max={25} step={1} value={theme.pageMargin} onChange={(pageMargin) => setTheme({ pageMargin })} />
          <Slider label="Space between sections" unit="mm" min={1} max={12} step={0.5} value={theme.sectionGap} onChange={(sectionGap) => setTheme({ sectionGap })} />
          <Select
            label="Header alignment"
            value={theme.headerAlign}
            onChange={(headerAlign) => setTheme({ headerAlign })}
            options={[{ value: 'left' as const, label: 'Left' }, { value: 'center' as const, label: 'Centred' }]}
          />
          <Select
            label="Bullet character"
            value={theme.bulletChar}
            onChange={(bulletChar) => setTheme({ bulletChar })}
            options={[
              { value: '•' as const, label: '•  Round' },
              { value: '–' as const, label: '–  Dash' },
              { value: '▸' as const, label: '▸  Triangle' },
              { value: '·' as const, label: '·  Dot' },
            ]}
          />
          <div className="pt-1">
            <Toggle label="Contact icons" checked={theme.showIcons} onChange={(showIcons) => setTheme({ showIcons })} hint="Some older parsers read icons as noise." />
            <Toggle label="Divider rules" checked={theme.showDividers} onChange={(showDividers) => setTheme({ showDividers })} />
            <Toggle label="Uppercase headings" checked={theme.uppercaseHeadings} onChange={(uppercaseHeadings) => setTheme({ uppercaseHeadings })} />
          </div>
        </div>
      </Collapsible>

      <button type="button" className="btn-ghost w-full text-xs" onClick={() => setTheme({ ...DEFAULT_THEME, template: theme.template })}>
        Reset design to defaults
      </button>
    </div>
  )
}

/** Tiny wireframe of each template so the choice is visual, not a guess. */
function TemplateThumb({ id, accent }: { id: Theme['template']; accent: string }) {
  const bar = (w: string, opacity = 0.25) => (
    <span className="block h-[2px] rounded-full" style={{ width: w, background: '#111', opacity }} />
  )
  return (
    <span className="flex h-14 w-11 shrink-0 flex-col gap-[3px] rounded border border-ink-200 bg-white p-1.5 dark:border-ink-700">
      {id === 'modern' ? (
        <span className="flex h-full gap-1">
          <span className="flex w-1/3 flex-col gap-[3px]">
            <span className="block h-[3px] rounded-full" style={{ width: '100%', background: accent }} />
            {bar('90%')}{bar('70%')}{bar('80%')}
          </span>
          <span className="flex flex-1 flex-col gap-[3px]">
            <span className="block h-[2px] rounded-full" style={{ width: '60%', background: accent }} />
            {bar('100%')}{bar('95%')}{bar('100%')}{bar('80%')}
          </span>
        </span>
      ) : id === 'compact' ? (
        <>
          <span className="block h-[3px] rounded-full" style={{ width: '70%', background: accent }} />
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex gap-1">
              <span className="block h-[2px] w-1/3 rounded-full" style={{ background: accent, opacity: 0.7 }} />
              <span className="flex flex-1 flex-col gap-[2px]">{bar('100%')}{bar('85%')}</span>
            </span>
          ))}
        </>
      ) : id === 'elegant' ? (
        <>
          <span className="mx-auto block h-[3px] w-3/4 rounded-full" style={{ background: accent }} />
          <span className="mx-auto block h-[1px] w-1/2" style={{ background: accent, opacity: 0.5 }} />
          <span className="mx-auto">{bar('55%')}</span>
          {bar('100%')}{bar('92%')}{bar('100%')}{bar('80%')}
        </>
      ) : id === 'technical' ? (
        <>
          <span className="block h-[3px] rounded-full" style={{ width: '65%', background: accent }} />
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="block h-[4px] w-[4px] rounded-[1px]" style={{ background: accent }} />
              <span className="flex flex-1 flex-col gap-[2px]">{bar('100%')}</span>
            </span>
          ))}
          {bar('90%')}{bar('75%')}
        </>
      ) : (
        <>
          <span className="block h-[3px] rounded-full" style={{ width: '70%', background: accent }} />
          {bar('45%', 0.4)}
          <span className="block h-[1px] w-full" style={{ background: accent, opacity: 0.5 }} />
          {bar('100%')}{bar('88%')}
          <span className="block h-[1px] w-full" style={{ background: accent, opacity: 0.5 }} />
          {bar('95%')}{bar('70%')}
        </>
      )}
    </span>
  )
}
