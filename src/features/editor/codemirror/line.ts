import type { Text, Line } from '@codemirror/text'

export type LineRange = Pick<Line, 'from' | 'to'>

export const lineRangeAt = (text: Text, pos: number): LineRange =>
  (({ from, to }) => ({ from, to }))(text.lineAt(pos))

export const lineRangesEqual = (a: LineRange, b: LineRange): boolean =>
  a.from === b.from && a.to === b.to
