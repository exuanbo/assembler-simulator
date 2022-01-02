import type { RangeValue, RangeSet } from '@codemirror/rangeset'

export const mapRangeSetToArray = <T extends RangeValue, U>(
  rangeSet: RangeSet<T>,
  callbackfn: (value: T, from: number, to: number) => U
): U[] => {
  const result = new Array<U>(rangeSet.size)
  const rangeCursor = rangeSet.iter()
  for (let i = 0; i < rangeSet.size; i++, rangeCursor.next()) {
    result[i] = callbackfn(rangeCursor.value!, rangeCursor.from, rangeCursor.to)
  }
  return result
}
