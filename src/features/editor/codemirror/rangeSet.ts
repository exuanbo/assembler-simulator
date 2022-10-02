import type { RangeValue, RangeSet } from '@codemirror/state'

export type RangeSetUpdateFilter<T extends RangeValue> = (
  from: number,
  to: number,
  value: T
) => boolean

export const mapRangeSetToArray = <T extends RangeValue, U>(
  rangeSet: RangeSet<T>,
  callbackfn: (from: number, to: number, value: T) => U
): U[] => {
  const valueCount = rangeSet.size
  const values = new Array<U>(valueCount)
  if (valueCount > 0) {
    const rangeCursor = rangeSet.iter()
    for (let valueIndex = 0; valueIndex < valueCount; valueIndex++, rangeCursor.next()) {
      values[valueIndex] = callbackfn(rangeCursor.from, rangeCursor.to, rangeCursor.value!)
    }
  }
  return values
}
