import type { Text, Line } from '@codemirror/text'

export type LineLoc = Pick<Line, 'from' | 'to' | 'number'>

export const lineLocAt = (text: Text, pos: number): LineLoc => {
  const { from, to, number } = text.lineAt(pos)
  return { from, to, number }
}

type LineRange = Omit<LineLoc, 'number'>

export const lineRangesEqual = (a: LineRange, b: LineRange): boolean =>
  a.from === b.from && a.to === b.to

export const lineRangesOverlap = (a: LineRange, b: LineRange): boolean =>
  a.from < b.to && b.from < a.to
