import type { RangeValue, RangeSet } from '@codemirror/rangeset'

export type RangeSetUpdateFilter<T extends RangeValue> = (
  from: number,
  to: number,
  value: T
) => boolean

export const mapRangeSetToArray = <T extends RangeValue, U>(
  rangeSet: RangeSet<T>,
  callbackfn: (from: number, to: number, value: T) => U
): U[] => {
  const result = new Array<U>(rangeSet.size)
  const rangeCursor = rangeSet.iter()
  for (let i = 0; i < rangeSet.size; i++, rangeCursor.next()) {
    result[i] = callbackfn(rangeCursor.from, rangeCursor.to, rangeCursor.value!)
  }
  return result
}
