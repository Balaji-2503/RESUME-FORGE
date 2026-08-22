export interface FontOption {
  id: string
  label: string
  stack: string
  kind: 'sans' | 'serif' | 'mono'
}

/** Only system-resident faces: a résumé must render identically when the PDF is
 *  produced on a machine that never loaded a webfont. */
export const FONTS: FontOption[] = [
  { id: 'inter', label: 'Inter / System Sans', kind: 'sans', stack: `'Inter','Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif` },
  { id: 'helvetica', label: 'Helvetica', kind: 'sans', stack: `'Helvetica Neue',Helvetica,Arial,sans-serif` },
  { id: 'calibri', label: 'Calibri', kind: 'sans', stack: `Calibri,'Segoe UI',Candara,sans-serif` },
  { id: 'garamond', label: 'Garamond', kind: 'serif', stack: `Garamond,'EB Garamond','Palatino Linotype',Palatino,serif` },
  { id: 'georgia', label: 'Georgia', kind: 'serif', stack: `Georgia,'Times New Roman',Times,serif` },
  { id: 'cambria', label: 'Cambria', kind: 'serif', stack: `Cambria,Constantia,Georgia,serif` },
  { id: 'times', label: 'Times New Roman', kind: 'serif', stack: `'Times New Roman',Times,serif` },
  { id: 'mono', label: 'Mono', kind: 'mono', stack: `'JetBrains Mono','SF Mono',Menlo,Consolas,monospace` },
]

export function fontStack(id: string): string {
  return (FONTS.find((f) => f.id === id) ?? FONTS[0]).stack
}
