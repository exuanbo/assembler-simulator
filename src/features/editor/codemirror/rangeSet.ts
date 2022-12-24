import { RangeValue, RangeSet } from '@codemirror/state'

type AnyRangeSet = RangeSet<RangeValue>

/**
 * @param a new `RangeSet`
 * @param b old `RangeSet`
 */
export const rangeSetsEqual = (a: AnyRangeSet, b: AnyRangeSet): boolean => RangeSet.eq([b], [a])

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
    for (let valueIndex = 0; rangeCursor.value !== null; valueIndex++, rangeCursor.next()) {
      values[valueIndex] = callbackfn(rangeCursor.from, rangeCursor.to, rangeCursor.value)
    }
  }
  return values
}

export const reduceRangeSet = <T extends RangeValue, U>(
  rangeSet: RangeSet<T>,
  callbackfn: (previousValue: U, currentValue: T, from: number, to: number) => U,
  initialValue: U
): U => {
  let accumulator = initialValue
  if (rangeSet.size > 0) {
    for (const rangeCursor = rangeSet.iter(); rangeCursor.value !== null; rangeCursor.next()) {
      accumulator = callbackfn(accumulator, rangeCursor.value, rangeCursor.from, rangeCursor.to)
    }
  }
  return accumulator
}
