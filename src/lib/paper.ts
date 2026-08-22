/** Page geometry in millimetres. The preview renders at these exact sizes so
 *  what you see is what the print pipeline produces. */
export const PAPER = {
  a4: { w: 210, h: 297, label: 'A4' },
  letter: { w: 215.9, h: 279.4, label: 'US Letter' },
} as const

export type PaperId = keyof typeof PAPER
export const MM_PER_PX = 96 / 25.4 // CSS px per mm at 96dpi
export const mmToPx = (mm: number) => mm * MM_PER_PX
