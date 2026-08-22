import { useState } from 'react'
import { Plus, Trash2, UserRound } from 'lucide-react'
import SectionEditor from '@/components/sections/SectionEditor'
import { Collapsible, IconButton, TextField, useSortable } from '@/components/ui'
import { SECTION_LABELS } from '@/lib/factory'
import { uid } from '@/lib/id'
import { addSection, moveSection, setProfile } from '@/state/actions'
import { store, useResume } from '@/state/store'
import type { SectionKind } from '@/lib/types'

const ADDABLE: SectionKind[] = [
  'summary', 'experience', 'education', 'projects', 'skills', 'certifications',
  'awards', 'publications', 'volunteering', 'languages', 'interests', 'custom',
]

export default function ContentPanel() {
  const resume = useResume()
  const sortable = useSortable((from, to) => moveSection(from, to))
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      <Collapsible
        title={<span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-ink-400" /> Personal details</span>}
        subtitle={resume.profile.fullName || 'Name, contact and links'}
        defaultOpen
      >
        <div className="space-y-2">
          <TextField label="Full name" value={resume.profile.fullName} onChange={(v) => setProfile({ fullName: v })} placeholder="Ananya Raghavan" />
          <TextField
            label="Headline"
            value={resume.profile.headline}
            onChange={(v) => setProfile({ headline: v })}
            placeholder="Senior Backend Engineer · Distributed Systems"
            hint="The role you are applying for, not necessarily the one you hold."
          />
          <div className="grid grid-cols-2 gap-2">
            <TextField label="Email" type="email" value={resume.profile.email} onChange={(v) => setProfile({ email: v })} placeholder="you@example.com" />
            <TextField label="Phone" value={resume.profile.phone} onChange={(v) => setProfile({ phone: v })} placeholder="+91 98450 11223" />
          </div>
          <TextField label="Location" value={resume.profile.location} onChange={(v) => setProfile({ location: v })} placeholder="Bengaluru, India" />
          <TextField label="Website" value={resume.profile.website} onChange={(v) => setProfile({ website: v })} placeholder="yoursite.dev" />
          <div className="grid grid-cols-2 gap-2">
            <TextField label="LinkedIn" value={resume.profile.linkedin} onChange={(v) => setProfile({ linkedin: v })} placeholder="linkedin.com/in/you" />
            <TextField label="GitHub" value={resume.profile.github} onChange={(v) => setProfile({ github: v })} placeholder="github.com/you" />
          </div>

          <div className="space-y-2 pt-1">
            {resume.profile.extras.map((extra) => (
              <div key={extra.id} className="flex items-end gap-2">
                <TextField
                  label="Label" className="w-28 shrink-0" value={extra.label} placeholder="Portfolio"
                  onChange={(v) => store.updateResume((r) => {
                    const e = r.profile.extras.find((x) => x.id === extra.id)
                    if (e) e.label = v
                  })}
                />
                <TextField
                  label="Value" className="flex-1" value={extra.value} placeholder="dribbble.com/you"
                  onChange={(v) => store.updateResume((r) => {
                    const e = r.profile.extras.find((x) => x.id === extra.id)
                    if (e) e.value = v
                  })}
                />
                <div className="pb-0.5">
                  <IconButton
                    label="Remove link" danger
                    onClick={() => store.updateResume((r) => { r.profile.extras = r.profile.extras.filter((x) => x.id !== extra.id) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost !px-2 !py-1 text-xs"
              onClick={() => store.updateResume((r) => { r.profile.extras.push({ id: uid('lnk'), label: '', value: '' }) })}
            >
              <Plus className="h-3.5 w-3.5" /> Add another link
            </button>
          </div>
        </div>
      </Collapsible>

      {resume.sections.map((section, index) => (
        <SectionEditor
          key={section.id}
          section={section}
          index={index}
          isOver={sortable.overIndex === index}
          rowProps={sortable.rowProps(index)}
          gripProps={sortable.gripProps(index)}
        />
      ))}

      {adding ? (
        <div className="card animate-fade-in p-2">
          <div className="mb-2 px-1 text-xs font-medium text-ink-500">Add a section</div>
          <div className="grid grid-cols-2 gap-1">
            {ADDABLE.map((kind) => (
              <button
                key={kind}
                type="button"
                className="btn-ghost justify-start !px-2 !py-1.5 text-xs"
                onClick={() => { addSection(kind); setAdding(false) }}
              >
                {SECTION_LABELS[kind]}
              </button>
            ))}
          </div>
          <button type="button" className="btn-ghost mt-1 w-full !py-1 text-xs" onClick={() => setAdding(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className="btn-soft w-full" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add section
        </button>
      )}
    </div>
  )
}
