import type { Text, Line, SelectionRange } from '@codemirror/state'

export const textToString = (text: Text): string => text.sliceString(0)

export type LineLoc = Pick<Line, 'from' | 'to' | 'number'>

export const lineLocAt = (text: Text, pos: number): LineLoc => {
  const { from, to, number } = text.lineAt(pos)
  return { from, to, number }
}

type LineRange = Pick<Line, 'from' | 'to'>

type LineRangeComparator = (a: LineRange, b: LineRange) => boolean

export const lineRangesEqual: LineRangeComparator = (a, b) => a.from === b.from && a.to === b.to

export const lineRangesOverlap: LineRangeComparator = (a, b) => a.from < b.to && a.to > b.from

export const hasNonEmptySelectionAtLine = (
  line: Line,
  selectionRanges: readonly SelectionRange[]
): boolean =>
  selectionRanges.some(
    selectionRange =>
      !selectionRange.empty && selectionRange.from < line.to && selectionRange.to > line.from
  )
