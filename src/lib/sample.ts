import { uid } from './id'
import { DEFAULT_THEME } from './factory'
import type { Resume } from './types'

/** Loaded by "Load example" so a first-time user sees a complete, well-written
 *  résumé rather than an empty grid — and can edit their way from it. */
export function sampleResume(): Resume {
  const now = Date.now()
  return {
    id: uid('res'),
    name: 'Example — Senior Backend Engineer',
    createdAt: now,
    updatedAt: now,
    targetJob: '',
    theme: { ...DEFAULT_THEME, template: 'modern', accent: '#0f766e' },
    profile: {
      fullName: 'Ananya Raghavan',
      headline: 'Senior Backend Engineer · Distributed Systems',
      email: 'ananya.raghavan@example.com',
      phone: '+91 98450 11223',
      location: 'Bengaluru, India',
      website: 'ananya.dev',
      linkedin: 'linkedin.com/in/ananyaraghavan',
      github: 'github.com/ananyar',
      extras: [],
    },
    sections: [
      {
        id: uid('sec'), kind: 'summary', title: 'Professional Summary', hidden: false,
        content:
          'Backend engineer with 7 years building payment and identity systems at scale. Took a monolith serving 40M requests/day through a service split with zero customer-facing downtime. Comfortable owning a system end to end — schema design, rollout, on-call, and the postmortem.',
      },
      {
        id: uid('sec'), kind: 'experience', title: 'Experience', hidden: false,
        items: [
          {
            id: uid('exp'), role: 'Senior Backend Engineer', company: 'Fintrail', location: 'Bengaluru',
            start: '2022-03', end: '', current: true, summary: '',
            tags: ['Go', 'Kafka', 'PostgreSQL'],
            bullets: [
              'Led the split of a 400k-line payments monolith into 6 services, cutting p99 checkout latency from 840ms to 210ms with no customer-facing downtime.',
              'Designed an idempotent ledger writer handling 12k TPS at peak; reconciliation breaks dropped from ~300/week to under 5.',
              'Rebuilt the retry pipeline on Kafka, recovering **$1.4M/year** in payments previously lost to transient gateway failures.',
              'Mentored 4 engineers through their first on-call rotation and wrote the runbooks the team still uses.',
            ],
          },
          {
            id: uid('exp'), role: 'Backend Engineer', company: 'Meridian Health', location: 'Pune',
            start: '2019-06', end: '2022-02', current: false, summary: '',
            tags: ['Python', 'Django', 'AWS'],
            bullets: [
              'Built the HIPAA-compliant records API used by 90+ clinics, sustaining 99.98% availability over two years.',
              'Cut nightly ETL runtime from 6h to 35m by replacing row-wise upserts with partitioned bulk loads.',
              'Introduced contract tests across 3 teams, dropping integration-related release rollbacks by 70%.',
            ],
          },
          {
            id: uid('exp'), role: 'Software Engineer', company: 'Bluecast', location: 'Pune',
            start: '2017-07', end: '2019-05', current: false, summary: '',
            tags: [],
            bullets: [
              'Shipped the analytics ingestion service handling 2B events/month on a 3-person team.',
              'Reduced cloud spend 38% by right-sizing instances and moving cold data to lifecycle-managed storage.',
            ],
          },
        ],
      },
      {
        id: uid('sec'), kind: 'skills', title: 'Skills', hidden: false, display: 'grouped',
        groups: [
          { id: uid('skg'), label: 'Languages', skills: ['Go', 'Python', 'TypeScript', 'SQL'] },
          { id: uid('skg'), label: 'Infrastructure', skills: ['Kubernetes', 'Kafka', 'PostgreSQL', 'Redis', 'Terraform', 'AWS'] },
          { id: uid('skg'), label: 'Practices', skills: ['Distributed systems', 'Observability', 'Incident response', 'API design'] },
        ],
      },
      {
        id: uid('sec'), kind: 'projects', title: 'Projects', hidden: false,
        items: [
          {
            id: uid('prj'), name: 'ledgerlite', role: 'Author', link: 'github.com/ananyar/ledgerlite',
            start: '2023', end: '', summary: 'Embeddable double-entry ledger for Go services.',
            tags: ['Go', 'SQLite'],
            bullets: ['1.8k GitHub stars; used in production by three payment startups.'],
          },
        ],
      },
      {
        id: uid('sec'), kind: 'education', title: 'Education', hidden: false,
        items: [
          {
            id: uid('edu'), degree: 'B.E. Computer Science', school: 'College of Engineering, Pune',
            location: 'Pune', start: '2013', end: '2017', current: false, score: 'CGPA 9.1/10', bullets: [],
          },
        ],
      },
      {
        id: uid('sec'), kind: 'certifications', title: 'Certifications', hidden: false,
        items: [
          { id: uid('itm'), title: 'Certified Kubernetes Administrator', subtitle: 'CNCF', date: '2023', link: '', description: '' },
        ],
      },
    ],
  }
}
