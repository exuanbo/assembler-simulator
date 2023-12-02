import type { RangeSet, RangeValue } from '@codemirror/state'

type RangeSetUpdate<T extends RangeValue> = Parameters<RangeSet<T>['update']>[0]

export type RangeSetUpdateFilter<T extends RangeValue> = RangeSetUpdate<T>['filter']
