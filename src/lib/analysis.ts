import { plainText } from './richtext'
import { sectionHasContent } from './sections'
import type { Resume, Section } from './types'

export type Severity = 'critical' | 'warning' | 'suggestion' | 'pass'

export interface Finding {
  id: string
  severity: Severity
  title: string
  detail: string
  /** Section id, so the review panel can jump straight to the problem. */
  target?: string
}

export interface Stats {
  words: number
  bullets: number
  quantifiedBullets: number
  actionVerbBullets: number
  longestBulletWords: number
  experienceItems: number
}

export interface KeywordMatch {
  term: string
  found: boolean
  count: number
}

export interface Review {
  score: number
  findings: Finding[]
  stats: Stats
  keywords: KeywordMatch[]
  keywordCoverage: number
}

const ACTION_VERBS = new Set([
  'accelerated','achieved','acquired','adapted','added','addressed','administered','advanced','advised','advocated',
  'analysed','analyzed','architected','assembled','assessed','audited','authored','automated','balanced','benchmarked',
  'boosted','budgeted','built','centralised','centralized','chaired','championed','clarified','coached','collaborated',
  'compiled','completed','composed','conceived','conducted','configured','consolidated','constructed','converted',
  'coordinated','created','cultivated','cut','debugged','decreased','defined','delivered','demonstrated','deployed',
  'designed','developed','devised','diagnosed','directed','doubled','drove','earned','edited','eliminated','enabled',
  'engineered','enhanced','ensured','established','evaluated','executed','expanded','expedited','facilitated','forecast',
  'formulated','founded','generated','grew','guided','halved','handled','headed','identified','implemented','improved',
  'increased','influenced','initiated','innovated','instituted','integrated','introduced','invented','investigated',
  'launched','led','leveraged','maintained','managed','mapped','marketed','mentored','migrated','minimised','minimized',
  'modelled','modeled','modernised','modernized','monitored','negotiated','operated','optimised','optimized','orchestrated',
  'organised','organized','overhauled','oversaw','partnered','performed','pioneered','piloted','planned','presented',
  'prioritised','prioritized','produced','programmed','proposed','prototyped','published','ran','rearchitected','rebuilt',
  'reduced','refactored','reorganised','reorganized','replaced','researched','resolved','restructured','revamped',
  'reviewed','revitalised','revitalized','saved','scaled','scoped','secured','shaped','shipped','simplified','solved',
  'spearheaded','standardised','standardized','streamlined','strengthened','supervised','supported','surpassed',
  'sustained','tested','tracked','trained','transformed','translated','tripled','troubleshot','unified','upgraded','validated','won','wrote',
])

const WEAK_OPENERS = [
  'responsible for','worked on','helped with','assisted with','tasked with','involved in',
  'in charge of','duties included','participated in','worked with',
]

const FLUFF = [
  'team player','hard worker','hard-working','go-getter','think outside the box','synergy','synergies',
  'detail-oriented','detail oriented','self-starter','results-driven','dynamic professional','proven track record',
  'best of breed','win-win','value add','rockstar','ninja','guru',
]

const PRONOUNS = /\b(i|me|my|mine|we|our|us)\b/gi

const STOP_WORDS = new Set([
  // grammar
  'a','an','and','are','as','at','be','by','for','from','has','have','in','is','it','its','of','on','or','that','the',
  'to','with','will','you','your','our','we','they','their','this','these','those','was','were','been','can','could',
  'should','would','about','into','across','within','using','use','used','than','them','then','there','here','how',
  'not','but','if','so','such','may','must','well','plus','like','also','who','what','when','where','while','all',
  'any','each','other','more','most','both','via','per','new','being','do','does','done','get','make','made','take',
  // job-posting boilerplate that carries no signal as a keyword
  'work','working','works','role','roles','team','teams','job','jobs','year','years','experience','experiences',
  'strong','good','great','excellent','ability','able','including','include','includes','etc','looking','seeking',
  'ideal','candidate','candidates','required','require','requires','requirements','responsibilities','responsible',
  'qualifications','preferred','position','positions','company','companies','opportunity','join','joining','hiring',
  'hire','help','helping','ensure','ensuring','across','environment','world','day','days','week','weeks','month',
  'months','plus','nice','must','own','owns','run','runs','deep','high','low','best','well','key','core','level',
  'senior','junior','lead','mid','years','track','record','skills','skill','knowledge','understanding','familiarity',
  'passion','passionate','looking','want','wants','need','needs','offer','offers','benefits','salary','apply',
  'essential','proven','demonstrated','various','ideally','ability','comfortable','familiar','excited',
])

/** Short tokens that are real technologies, not noise. */
const SHORT_TERMS = new Set(['go','r','c','ai','ml','qa','ux','ui','os','db','ci','cd','sql','api','aws','gcp','k8s','ios','css','php','vue','npm','rpc','etl','llm','bi','erp','crm','seo','sre'])


const words = (s: string): string[] =>
  (plainText(s).toLowerCase().match(/[a-z][a-z0-9+#.\-]*/g) ?? [])
    .map((w) => w.replace(/[.\-]+$/, ''))
    .filter(Boolean)

/** Splits on punctuation so two-word phrases never straddle a clause boundary
 *  ("…run Kafka pipelines, own PostgreSQL…" must not yield "pipelines own"). */
const clauses = (s: string): string[] => plainText(s).split(/[.,;:!?()[\]{}\n\r/|•·—–]+/)
const countWords = (s: string) => (plainText(s).trim() ? plainText(s).trim().split(/\s+/).length : 0)

function allBullets(sections: Section[]): { text: string; sectionId: string }[] {
  const out: { text: string; sectionId: string }[] = []
  for (const s of sections) {
    if (s.hidden) continue
    if (s.kind === 'experience' || s.kind === 'projects' || s.kind === 'education' || s.kind === 'custom') {
      for (const item of s.items) {
        if (item.hidden) continue
        for (const b of item.bullets) if (b.trim()) out.push({ text: b, sectionId: s.id })
      }
    }
  }
  return out
}

function resumeText(resume: Resume): string {
  const parts: string[] = [resume.profile.headline]
  for (const s of resume.sections) {
    if (s.hidden) continue
    parts.push(s.title)
    switch (s.kind) {
      case 'summary': parts.push(s.content); break
      case 'skills':
        for (const g of s.groups) { if (!g.hidden) parts.push(g.label, g.skills.join(' ')) }
        break
      case 'experience':
        for (const i of s.items) if (!i.hidden) parts.push(i.role, i.company, i.summary, i.tags.join(' '), i.bullets.join(' '))
        break
      case 'projects':
        for (const i of s.items) if (!i.hidden) parts.push(i.name, i.role, i.summary, i.tags.join(' '), i.bullets.join(' '))
        break
      case 'education':
        for (const i of s.items) if (!i.hidden) parts.push(i.degree, i.school, i.bullets.join(' '))
        break
      case 'custom':
        for (const i of s.items) if (!i.hidden) parts.push(i.title, i.subtitle, i.summary, i.bullets.join(' '))
        break
      default:
        for (const i of s.items) if (!i.hidden) parts.push(i.title, i.subtitle, i.description)
    }
  }
  return parts.filter(Boolean).join('\n')
}

/** Pulls candidate keywords out of a pasted job description: meaningful single
 *  words plus two-word phrases that repeat. Phrases win over their own parts,
 *  so "incident response" appears once rather than as two vague halves. */
export function extractKeywords(jd: string, limit = 24): string[] {
  if (!jd.trim()) return []

  const usable = (w: string) =>
    !STOP_WORDS.has(w) && (w.length > 3 || SHORT_TERMS.has(w))

  const unigrams = new Map<string, number>()
  for (const w of words(jd)) if (usable(w)) unigrams.set(w, (unigrams.get(w) ?? 0) + 1)

  // Phrases only count when they recur — a one-off pairing is usually an
  // accident of sentence structure rather than a term of art.
  const bigrams = new Map<string, number>()
  for (const clause of clauses(jd)) {
    const ws = words(clause)
    for (let i = 0; i < ws.length - 1; i++) {
      const a = ws[i], b = ws[i + 1]
      if (!usable(a) || !usable(b)) continue
      const phrase = `${a} ${b}`
      bigrams.set(phrase, (bigrams.get(phrase) ?? 0) + 1)
    }
  }

  const phrases = [...bigrams.entries()].filter(([, n]) => n >= 2)
  const claimed = new Set(phrases.flatMap(([p]) => p.split(' ')))

  // Ties on frequency break toward the longer, more specific term.
  const specificity = (term: string) => Math.min(term.length, 16) / 160

  const ranked = [
    ...phrases.map(([term, n]) => [term, n * 1.5 + specificity(term)] as const),
    ...[...unigrams.entries()]
      .filter(([term]) => !claimed.has(term))
      .map(([term, n]) => [term, n + specificity(term)] as const),
  ]

  return ranked
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term]) => term)
}

function firstWord(bullet: string): string {
  return (plainText(bullet).trim().match(/^[a-zA-Z]+/) ?? [''])[0].toLowerCase()
}

export function reviewResume(resume: Resume): Review {
  const findings: Finding[] = []
  const visible = resume.sections.filter((s) => !s.hidden)
  const bullets = allBullets(resume.sections)
  const text = resumeText(resume)
  const totalWords = countWords(`${resume.profile.fullName} ${text}`)

  // ---- Contact details -----------------------------------------------------
  const p = resume.profile
  const missingContact = [
    !p.fullName.trim() && 'name',
    !p.email.trim() && 'email',
    !p.phone.trim() && 'phone',
    !p.location.trim() && 'location',
  ].filter(Boolean) as string[]

  if (missingContact.length) {
    findings.push({
      id: 'contact',
      severity: missingContact.includes('name') || missingContact.includes('email') ? 'critical' : 'warning',
      title: `Missing contact details: ${missingContact.join(', ')}`,
      detail: 'Recruiters and applicant tracking systems key off these fields first. An email and a phone number are the minimum.',
    })
  } else {
    findings.push({ id: 'contact', severity: 'pass', title: 'Contact block is complete', detail: 'Name, email, phone and location are all present.' })
  }

  if (p.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) {
    findings.push({ id: 'email-format', severity: 'warning', title: 'Email address looks malformed', detail: `"${p.email}" is not a valid address — a typo here costs you the interview.` })
  }

  // ---- Summary -------------------------------------------------------------
  const summary = visible.find((s) => s.kind === 'summary')
  if (summary && summary.kind === 'summary') {
    const w = countWords(summary.content)
    if (w === 0) {
      findings.push({ id: 'summary-empty', severity: 'warning', target: summary.id, title: 'Summary section is empty', detail: 'Either write 2–3 lines on what you do and your strongest result, or hide the section.' })
    } else if (w < 20) {
      findings.push({ id: 'summary-short', severity: 'suggestion', target: summary.id, title: 'Summary is very short', detail: `${w} words. Aim for 35–70: role, years, domain, and one quantified achievement.` })
    } else if (w > 110) {
      findings.push({ id: 'summary-long', severity: 'suggestion', target: summary.id, title: 'Summary is long', detail: `${w} words. Trim to under 80 — the rest of the résumé does the proving.` })
    } else {
      findings.push({ id: 'summary-ok', severity: 'pass', target: summary.id, title: 'Summary is well sized', detail: `${w} words.` })
    }
  }

  // ---- Experience ----------------------------------------------------------
  const exp = visible.find((s) => s.kind === 'experience')
  const expItems = exp && exp.kind === 'experience' ? exp.items.filter((i) => !i.hidden) : []
  if (!exp) {
    findings.push({ id: 'no-experience', severity: 'critical', title: 'No experience section', detail: 'Almost every screener looks for this first. Add it even if the entries are internships or freelance work.' })
  } else if (!expItems.length) {
    findings.push({ id: 'experience-empty', severity: 'critical', target: exp.id, title: 'Experience section has no entries', detail: 'Add at least one role with dates and 2–4 result-focused bullets.' })
  }

  for (const item of expItems) {
    const label = item.role || item.company || 'an entry'
    if (!item.role.trim() || !item.company.trim()) {
      findings.push({ id: `exp-title-${item.id}`, severity: 'warning', target: exp!.id, title: `Incomplete role heading (${label})`, detail: 'Both job title and employer should be filled in — parsers use them to build your work history.' })
    }
    if (!item.start.trim()) {
      findings.push({ id: `exp-dates-${item.id}`, severity: 'warning', target: exp!.id, title: `Missing dates for ${label}`, detail: 'Undated roles read as a gap you are hiding. Month + year is the norm.' })
    }
    const filled = item.bullets.filter((b) => b.trim()).length
    if (filled === 0) {
      findings.push({ id: `exp-bullets-${item.id}`, severity: 'warning', target: exp!.id, title: `No bullets for ${label}`, detail: 'A role with no bullets tells the reader nothing about what you actually did.' })
    } else if (filled > 6) {
      findings.push({ id: `exp-bullets-many-${item.id}`, severity: 'suggestion', target: exp!.id, title: `${filled} bullets under ${label}`, detail: 'Past about five, readers skim and stop. Keep the strongest and cut the rest.' })
    }
  }

  // ---- Bullet quality ------------------------------------------------------
  let quantified = 0
  let actionVerbs = 0
  let longest = 0
  const weakBullets: string[] = []
  const longBullets: string[] = []
  const verbCounts = new Map<string, number>()

  for (const { text: b } of bullets) {
    const clean = plainText(b)
    const w = countWords(clean)
    longest = Math.max(longest, w)
    if (/\d/.test(clean)) quantified++
    const fw = firstWord(clean)
    if (ACTION_VERBS.has(fw)) {
      actionVerbs++
      verbCounts.set(fw, (verbCounts.get(fw) ?? 0) + 1)
    }
    const lower = clean.toLowerCase()
    if (WEAK_OPENERS.some((weak) => lower.startsWith(weak))) weakBullets.push(clean)
    if (w > 34) longBullets.push(clean)
  }

  if (bullets.length) {
    const quantRatio = quantified / bullets.length
    if (quantRatio < 0.35) {
      findings.push({
        id: 'quantify', severity: quantRatio < 0.15 ? 'warning' : 'suggestion',
        title: `Only ${quantified} of ${bullets.length} bullets contain a number`,
        detail: 'Numbers are the difference between a claim and evidence. Add scale (users, requests, revenue), change (%, before → after) or time saved.',
      })
    } else {
      findings.push({ id: 'quantify', severity: 'pass', title: `${quantified} of ${bullets.length} bullets are quantified`, detail: 'Good — measurable results carry far more weight than duties.' })
    }

    const verbRatio = actionVerbs / bullets.length
    if (verbRatio < 0.6) {
      findings.push({
        id: 'verbs', severity: verbRatio < 0.35 ? 'warning' : 'suggestion',
        title: `${bullets.length - actionVerbs} bullets don't open with a strong verb`,
        detail: 'Start each bullet with what you did: Built, Led, Reduced, Migrated, Shipped.',
      })
    } else {
      findings.push({ id: 'verbs', severity: 'pass', title: 'Bullets lead with strong verbs', detail: `${actionVerbs} of ${bullets.length} open with an action verb.` })
    }

    const overused = [...verbCounts.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1])
    if (overused.length) {
      findings.push({
        id: 'verb-repeat', severity: 'suggestion',
        title: `"${overused[0][0]}" opens ${overused[0][1]} bullets`,
        detail: 'Repeating one verb flattens the résumé. Vary it — the range of verbs signals a range of work.',
      })
    }
  }

  if (weakBullets.length) {
    findings.push({
      id: 'weak-openers', severity: 'warning',
      title: `${weakBullets.length} bullet${weakBullets.length > 1 ? 's' : ''} start with a passive phrase`,
      detail: `e.g. "${weakBullets[0].slice(0, 80)}…" — "Responsible for" describes a job description, not an achievement.`,
    })
  }

  if (longBullets.length) {
    findings.push({
      id: 'long-bullets', severity: 'suggestion',
      title: `${longBullets.length} bullet${longBullets.length > 1 ? 's are' : ' is'} over 34 words`,
      detail: 'Long bullets get skipped. Split them, or cut the setup and keep the result.',
    })
  }

  // ---- Tone ----------------------------------------------------------------
  const pronounHits = text.match(PRONOUNS) ?? []
  if (pronounHits.length > 2) {
    findings.push({
      id: 'pronouns', severity: 'suggestion',
      title: `First-person pronouns used ${pronounHits.length} times`,
      detail: 'Résumés conventionally drop "I" and "we": "Led the migration", not "I led the migration".',
    })
  }

  const lowerText = text.toLowerCase()
  const fluffHits = FLUFF.filter((f) => lowerText.includes(f))
  if (fluffHits.length) {
    findings.push({
      id: 'fluff', severity: 'suggestion',
      title: `Filler phrases found: ${fluffHits.slice(0, 3).join(', ')}`,
      detail: 'These say nothing a reader can verify. Replace each with the evidence that made you think it.',
    })
  }

  // ---- Structure -----------------------------------------------------------
  if (!visible.some((s) => s.kind === 'skills')) {
    findings.push({ id: 'no-skills', severity: 'warning', title: 'No skills section', detail: 'Keyword-matching systems lean on this section heavily. List tools and technologies you would defend in an interview.' })
  }
  if (!visible.some((s) => s.kind === 'education')) {
    findings.push({ id: 'no-education', severity: 'suggestion', title: 'No education section', detail: 'Most templates expect one. If you are far into your career it can be brief, but it should exist.' })
  }

  for (const s of visible.filter((x) => !sectionHasContent(x))) {
    findings.push({
      id: `empty-${s.id}`, severity: 'suggestion', target: s.id,
      title: `"${s.title}" has no content yet`,
      detail: "It is skipped when the page renders, so nothing is broken — but it is a section you meant to write. Fill it in, or delete it to tidy the editor.",
    })
  }

  // ---- Length --------------------------------------------------------------
  if (totalWords > 900) {
    findings.push({ id: 'length', severity: 'suggestion', title: `${totalWords} words — likely over two pages`, detail: 'Unless you are in academia, aim for one page under 10 years of experience and two beyond that.' })
  } else if (totalWords > 0 && totalWords < 150) {
    findings.push({ id: 'length', severity: 'warning', title: `Only ${totalWords} words`, detail: 'There is not enough here to assess you. Expand your most recent role first.' })
  }

  // ---- Job-description match ----------------------------------------------
  const terms = extractKeywords(resume.targetJob)
  const haystack = ` ${words(text).join(' ')} `
  const keywords: KeywordMatch[] = terms.map((term) => {
    const needle = ` ${term} `
    let count = 0
    let idx = haystack.indexOf(needle)
    while (idx !== -1) { count++; idx = haystack.indexOf(needle, idx + 1) }
    return { term, found: count > 0, count }
  })
  const keywordCoverage = keywords.length ? keywords.filter((k) => k.found).length / keywords.length : 0

  if (keywords.length) {
    const missing = keywords.filter((k) => !k.found).map((k) => k.term)
    if (missing.length) {
      findings.push({
        id: 'keywords', severity: keywordCoverage < 0.4 ? 'warning' : 'suggestion',
        title: `${Math.round(keywordCoverage * 100)}% keyword coverage against the target job`,
        detail: `Not mentioned: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}. Only add what you can honestly claim.`,
      })
    } else {
      findings.push({ id: 'keywords', severity: 'pass', title: 'Every extracted keyword appears in your résumé', detail: 'Strong alignment with the target role.' })
    }
  }

  // ---- Score ---------------------------------------------------------------
  const penalties = findings.reduce((sum, f) => {
    if (f.severity === 'critical') return sum + 18
    if (f.severity === 'warning') return sum + 7
    if (f.severity === 'suggestion') return sum + 3
    return sum
  }, 0)
  const keywordBonus = keywords.length ? (keywordCoverage - 0.5) * 10 : 0
  const score = Math.max(0, Math.min(100, Math.round(100 - penalties + keywordBonus)))

  const order: Record<Severity, number> = { critical: 0, warning: 1, suggestion: 2, pass: 3 }
  findings.sort((a, b) => order[a.severity] - order[b.severity])

  return {
    score,
    findings,
    keywords,
    keywordCoverage,
    stats: {
      words: totalWords,
      bullets: bullets.length,
      quantifiedBullets: quantified,
      actionVerbBullets: actionVerbs,
      longestBulletWords: longest,
      experienceItems: expItems.length,
    },
  }
}
