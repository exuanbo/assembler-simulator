import type { RangeValue, RangeSet } from '@codemirror/state'

type RangeValueCallback<T extends RangeValue, U> = (from: number, to: number, value: T) => U

export type RangeSetUpdateFilter<T extends RangeValue> = RangeValueCallback<T, boolean>

export const mapRangeSetToArray = <T extends RangeValue, U>(
  rangeSet: RangeSet<T>,
  callbackfn: RangeValueCallback<T, U>
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
