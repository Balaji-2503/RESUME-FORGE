import { Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import BulletEditor from './BulletEditor'
import DateRangeFields from './DateRangeFields'
import { Collapsible, Empty, Grip, IconButton, Select, TagField, TextArea, TextField, useSortable } from '@/components/ui'
import {
  duplicateSection, moveItem, removeItem, removeSection, toggleItem, toggleSection, updateSection,
} from '@/state/actions'
import { newCustomItem, newEducation, newExperience, newProject, newSimple, newSkillGroup } from '@/lib/factory'
import { dateRange } from '@/lib/format'
import type {
  CustomSection, EducationSection, ExperienceSection, ProjectsSection, Section,
  SimpleSection, SkillsSection, SummarySection,
} from '@/lib/types'

/* Wrapper: title, visibility, delete, and the drag grip for the section list. */
export default function SectionEditor({
  section, index, gripProps, rowProps, isOver,
}: {
  section: Section
  index: number
  gripProps: Record<string, unknown>
  rowProps: Record<string, unknown>
  isOver: boolean
}) {
  const count = itemCount(section)

  return (
    <div {...rowProps} className={`rounded-xl transition ${isOver ? 'ring-2 ring-brand-500/50' : ''}`}>
      <Collapsible
        tone={section.hidden ? 'muted' : 'default'}
        title={
          <span className="flex items-center gap-1.5">
            <Grip {...gripProps} />
            <span>{section.title}</span>
          </span>
        }
        subtitle={section.hidden ? 'Hidden from the résumé' : count}
        defaultOpen={index < 2}
        actions={
          <>
            <IconButton label={section.hidden ? 'Show section' : 'Hide section'} onClick={() => toggleSection(section.id)}>
              {section.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </IconButton>
            <IconButton label="Duplicate section" onClick={() => duplicateSection(section.id)}>
              <Copy className="h-4 w-4" />
            </IconButton>
            <IconButton label="Delete section" danger onClick={() => removeSection(section.id)}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </>
        }
      >
        <div className="space-y-3">
          <TextField
            label="Section heading"
            value={section.title}
            onChange={(v) => updateSection(section.id, (s) => { s.title = v })}
          />
          <Body section={section} />
        </div>
      </Collapsible>
    </div>
  )
}

function itemCount(section: Section): string {
  if (section.kind === 'summary') {
    const words = section.content.trim() ? section.content.trim().split(/\s+/).length : 0
    return `${words} word${words === 1 ? '' : 's'}`
  }
  const n = section.kind === 'skills' ? section.groups.length : section.items.length
  return `${n} ${n === 1 ? 'entry' : 'entries'}`
}

function Body({ section }: { section: Section }) {
  switch (section.kind) {
    case 'summary': return <SummaryBody section={section} />
    case 'experience': return <ExperienceBody section={section} />
    case 'education': return <EducationBody section={section} />
    case 'projects': return <ProjectsBody section={section} />
    case 'skills': return <SkillsBody section={section} />
    case 'custom': return <CustomBody section={section} />
    default: return <SimpleBody section={section} />
  }
}

/* ----------------------------------------------------------------- items -- */

function ItemShell({
  sectionId, itemId, title, subtitle, hidden, children,
}: {
  sectionId: string
  itemId: string
  title: string
  subtitle?: string
  hidden?: boolean
  children: React.ReactNode
  }) {
  return (
    <div className={`rounded-lg border border-ink-200 p-2.5 dark:border-ink-800 ${hidden ? 'opacity-55' : ''}`}>
      <div className="mb-2 flex items-center gap-1">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{title || 'Untitled'}</div>
          {subtitle ? <div className="truncate text-xs text-ink-400">{subtitle}</div> : null}
        </div>
        <IconButton label={hidden ? 'Show entry' : 'Hide entry'} onClick={() => toggleItem(sectionId, itemId)}>
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </IconButton>
        <IconButton label="Delete entry" danger onClick={() => removeItem(sectionId, itemId)}>
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
      {children}
    </div>
  )
}

/** Shared list frame: reorder handling plus the "Add" button. */
function ItemList({
  sectionId, ids, onAdd, addLabel, empty, children,
}: {
  sectionId: string
  ids: string[]
  onAdd: () => void
  addLabel: string
  empty: string
  children: (id: string, index: number, grip: Record<string, unknown>) => React.ReactNode
}) {
  const sortable = useSortable((from, to) => moveItem(sectionId, from, to))
  return (
    <div className="space-y-2">
      {ids.length === 0 ? <Empty>{empty}</Empty> : null}
      {ids.map((id, index) => (
        <div
          key={id}
          {...sortable.rowProps(index)}
          className={`flex items-start gap-1 rounded-lg transition ${sortable.overIndex === index ? 'ring-2 ring-brand-500/40' : ''}`}
        >
          <div className="pt-3">
            <Grip {...sortable.gripProps(index)} />
          </div>
          <div className="min-w-0 flex-1">{children(id, index, sortable.gripProps(index))}</div>
        </div>
      ))}
      <button type="button" className="btn-soft w-full !py-1.5 text-xs" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  )
}

/* --------------------------------------------------------------- bodies --- */

function SummaryBody({ section }: { section: SummarySection }) {
  return (
    <TextArea
      label="Summary"
      value={section.content}
      minRows={4}
      placeholder="Backend engineer with 7 years building payment systems at scale…"
      hint="Two or three lines. What you do, how long, and your strongest result."
      onChange={(v) => updateSection<SummarySection>(section.id, (s) => { s.content = v })}
    />
  )
}

function ExperienceBody({ section }: { section: ExperienceSection }) {
  const edit = (id: string, recipe: (item: ExperienceSection['items'][number]) => void) =>
    updateSection<ExperienceSection>(section.id, (s) => {
      const item = s.items.find((i) => i.id === id)
      if (item) recipe(item)
    })

  return (
    <ItemList
      sectionId={section.id}
      ids={section.items.map((i) => i.id)}
      addLabel="Add role"
      empty="No roles yet."
      onAdd={() => updateSection<ExperienceSection>(section.id, (s) => { s.items.push(newExperience()) })}
    >
      {(id) => {
        const item = section.items.find((i) => i.id === id)!
        return (
          <ItemShell
            sectionId={section.id}
            itemId={id}
            hidden={item.hidden}
            title={item.role || item.company}
            subtitle={[item.company && item.role ? item.company : '', dateRange(item.start, item.end, item.current)].filter(Boolean).join(' · ')}
          >
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Job title" value={item.role} onChange={(v) => edit(id, (i) => { i.role = v })} placeholder="Senior Backend Engineer" />
                <TextField label="Company" value={item.company} onChange={(v) => edit(id, (i) => { i.company = v })} placeholder="Fintrail" />
              </div>
              <TextField label="Location" value={item.location} onChange={(v) => edit(id, (i) => { i.location = v })} placeholder="Bengaluru · Remote" />
              <DateRangeFields
                start={item.start} end={item.end} current={item.current}
                onStart={(v) => edit(id, (i) => { i.start = v })}
                onEnd={(v) => edit(id, (i) => { i.end = v })}
                onCurrent={(v) => edit(id, (i) => { i.current = v })}
              />
              <TextField label="One-line context (optional)" value={item.summary} onChange={(v) => edit(id, (i) => { i.summary = v })} placeholder="Series B fintech, 40 engineers" />
              <BulletEditor bullets={item.bullets} onChange={(next) => edit(id, (i) => { i.bullets = next })} />
              <TagField label="Tech / tags" values={item.tags} onChange={(next) => edit(id, (i) => { i.tags = next })} placeholder="Go, Kafka, PostgreSQL" />
            </div>
          </ItemShell>
        )
      }}
    </ItemList>
  )
}

function EducationBody({ section }: { section: EducationSection }) {
  const edit = (id: string, recipe: (item: EducationSection['items'][number]) => void) =>
    updateSection<EducationSection>(section.id, (s) => {
      const item = s.items.find((i) => i.id === id)
      if (item) recipe(item)
    })

  return (
    <ItemList
      sectionId={section.id}
      ids={section.items.map((i) => i.id)}
      addLabel="Add qualification"
      empty="No qualifications yet."
      onAdd={() => updateSection<EducationSection>(section.id, (s) => { s.items.push(newEducation()) })}
    >
      {(id) => {
        const item = section.items.find((i) => i.id === id)!
        return (
          <ItemShell sectionId={section.id} itemId={id} hidden={item.hidden} title={item.degree || item.school} subtitle={item.school && item.degree ? item.school : ''}>
            <div className="space-y-2">
              <TextField label="Degree" value={item.degree} onChange={(v) => edit(id, (i) => { i.degree = v })} placeholder="B.E. Computer Science" />
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Institution" value={item.school} onChange={(v) => edit(id, (i) => { i.school = v })} placeholder="College of Engineering" />
                <TextField label="Location" value={item.location} onChange={(v) => edit(id, (i) => { i.location = v })} placeholder="Pune" />
              </div>
              <DateRangeFields
                start={item.start} end={item.end} current={item.current}
                onStart={(v) => edit(id, (i) => { i.start = v })}
                onEnd={(v) => edit(id, (i) => { i.end = v })}
                onCurrent={(v) => edit(id, (i) => { i.current = v })}
                currentLabel="Currently studying"
              />
              <TextField label="Grade (optional)" value={item.score} onChange={(v) => edit(id, (i) => { i.score = v })} placeholder="CGPA 9.1/10" />
              <BulletEditor bullets={item.bullets} onChange={(next) => edit(id, (i) => { i.bullets = next })} placeholder="Thesis, coursework, societies…" />
            </div>
          </ItemShell>
        )
      }}
    </ItemList>
  )
}

function ProjectsBody({ section }: { section: ProjectsSection }) {
  const edit = (id: string, recipe: (item: ProjectsSection['items'][number]) => void) =>
    updateSection<ProjectsSection>(section.id, (s) => {
      const item = s.items.find((i) => i.id === id)
      if (item) recipe(item)
    })

  return (
    <ItemList
      sectionId={section.id}
      ids={section.items.map((i) => i.id)}
      addLabel="Add project"
      empty="No projects yet."
      onAdd={() => updateSection<ProjectsSection>(section.id, (s) => { s.items.push(newProject()) })}
    >
      {(id) => {
        const item = section.items.find((i) => i.id === id)!
        return (
          <ItemShell sectionId={section.id} itemId={id} hidden={item.hidden} title={item.name} subtitle={item.role}>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Project" value={item.name} onChange={(v) => edit(id, (i) => { i.name = v })} placeholder="ledgerlite" />
                <TextField label="Your role" value={item.role} onChange={(v) => edit(id, (i) => { i.role = v })} placeholder="Author" />
              </div>
              <TextField label="Link" value={item.link} onChange={(v) => edit(id, (i) => { i.link = v })} placeholder="github.com/you/project" />
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Start" value={item.start} onChange={(v) => edit(id, (i) => { i.start = v })} placeholder="2023" />
                <TextField label="End" value={item.end} onChange={(v) => edit(id, (i) => { i.end = v })} placeholder="2024" />
              </div>
              <TextField label="One-line description" value={item.summary} onChange={(v) => edit(id, (i) => { i.summary = v })} placeholder="Embeddable double-entry ledger for Go services." />
              <BulletEditor bullets={item.bullets} onChange={(next) => edit(id, (i) => { i.bullets = next })} placeholder="1.8k stars; used in production by three startups." />
              <TagField label="Tech / tags" values={item.tags} onChange={(next) => edit(id, (i) => { i.tags = next })} placeholder="Go, SQLite" />
            </div>
          </ItemShell>
        )
      }}
    </ItemList>
  )
}

function SkillsBody({ section }: { section: SkillsSection }) {
  const edit = (id: string, recipe: (g: SkillsSection['groups'][number]) => void) =>
    updateSection<SkillsSection>(section.id, (s) => {
      const g = s.groups.find((x) => x.id === id)
      if (g) recipe(g)
    })

  return (
    <div className="space-y-3">
      <Select
        label="Layout"
        value={section.display}
        onChange={(v) => updateSection<SkillsSection>(section.id, (s) => { s.display = v })}
        options={[
          { value: 'grouped', label: 'Grouped — "Languages: Go, Python"' },
          { value: 'chips', label: 'Chips — tinted pills' },
          { value: 'inline', label: 'Inline — one dotted run' },
        ]}
      />
      <ItemList
        sectionId={section.id}
        ids={section.groups.map((g) => g.id)}
        addLabel="Add skill group"
        empty="No skill groups yet."
        onAdd={() => updateSection<SkillsSection>(section.id, (s) => { s.groups.push(newSkillGroup()) })}
      >
        {(id) => {
          const group = section.groups.find((g) => g.id === id)!
          return (
            <ItemShell sectionId={section.id} itemId={id} hidden={group.hidden} title={group.label || 'Group'} subtitle={`${group.skills.length} skills`}>
              <div className="space-y-2">
                <TextField label="Group label" value={group.label} onChange={(v) => edit(id, (g) => { g.label = v })} placeholder="Languages" />
                <TagField label="Skills" values={group.skills} onChange={(next) => edit(id, (g) => { g.skills = next })} placeholder="Type a skill, press Enter" />
              </div>
            </ItemShell>
          )
        }}
      </ItemList>
    </div>
  )
}

function SimpleBody({ section }: { section: SimpleSection }) {
  const edit = (id: string, recipe: (item: SimpleSection['items'][number]) => void) =>
    updateSection<SimpleSection>(section.id, (s) => {
      const item = s.items.find((i) => i.id === id)
      if (item) recipe(item)
    })

  const labels: Record<SimpleSection['kind'], { title: string; subtitle: string; date: string }> = {
    certifications: { title: 'Certification', subtitle: 'Issuer', date: 'Year' },
    awards: { title: 'Award', subtitle: 'Awarded by', date: 'Year' },
    publications: { title: 'Title', subtitle: 'Venue', date: 'Year' },
    volunteering: { title: 'Role', subtitle: 'Organisation', date: 'Period' },
    languages: { title: 'Language', subtitle: 'Proficiency', date: '' },
    interests: { title: 'Interest', subtitle: 'Detail', date: '' },
  }
  const l = labels[section.kind]

  return (
    <ItemList
      sectionId={section.id}
      ids={section.items.map((i) => i.id)}
      addLabel={`Add ${l.title.toLowerCase()}`}
      empty="Nothing here yet."
      onAdd={() => updateSection<SimpleSection>(section.id, (s) => { s.items.push(newSimple()) })}
    >
      {(id) => {
        const item = section.items.find((i) => i.id === id)!
        return (
          <ItemShell sectionId={section.id} itemId={id} hidden={item.hidden} title={item.title} subtitle={item.subtitle}>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <TextField label={l.title} value={item.title} onChange={(v) => edit(id, (i) => { i.title = v })} />
                <TextField label={l.subtitle} value={item.subtitle} onChange={(v) => edit(id, (i) => { i.subtitle = v })} />
              </div>
              {l.date ? <TextField label={l.date} value={item.date} onChange={(v) => edit(id, (i) => { i.date = v })} placeholder="2024" /> : null}
              <TextField label="Link (optional)" value={item.link} onChange={(v) => edit(id, (i) => { i.link = v })} />
              <TextField label="Detail (optional)" value={item.description} onChange={(v) => edit(id, (i) => { i.description = v })} />
            </div>
          </ItemShell>
        )
      }}
    </ItemList>
  )
}

function CustomBody({ section }: { section: CustomSection }) {
  const edit = (id: string, recipe: (item: CustomSection['items'][number]) => void) =>
    updateSection<CustomSection>(section.id, (s) => {
      const item = s.items.find((i) => i.id === id)
      if (item) recipe(item)
    })

  return (
    <ItemList
      sectionId={section.id}
      ids={section.items.map((i) => i.id)}
      addLabel="Add entry"
      empty="No entries yet."
      onAdd={() => updateSection<CustomSection>(section.id, (s) => { s.items.push(newCustomItem()) })}
    >
      {(id) => {
        const item = section.items.find((i) => i.id === id)!
        return (
          <ItemShell sectionId={section.id} itemId={id} hidden={item.hidden} title={item.title} subtitle={item.subtitle}>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Title" value={item.title} onChange={(v) => edit(id, (i) => { i.title = v })} />
                <TextField label="Subtitle" value={item.subtitle} onChange={(v) => edit(id, (i) => { i.subtitle = v })} />
              </div>
              <TextField label="Location" value={item.location} onChange={(v) => edit(id, (i) => { i.location = v })} />
              <DateRangeFields
                start={item.start} end={item.end} current={item.current}
                onStart={(v) => edit(id, (i) => { i.start = v })}
                onEnd={(v) => edit(id, (i) => { i.end = v })}
                onCurrent={(v) => edit(id, (i) => { i.current = v })}
                currentLabel="Ongoing"
              />
              <TextField label="Description" value={item.summary} onChange={(v) => edit(id, (i) => { i.summary = v })} />
              <BulletEditor bullets={item.bullets} onChange={(next) => edit(id, (i) => { i.bullets = next })} />
            </div>
          </ItemShell>
        )
      }}
    </ItemList>
  )
}
