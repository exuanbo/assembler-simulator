/* eslint-disable @typescript-eslint/unbound-method */

import { useDebugValue } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

import { type RootState, store } from './store'

export type StateSelector<TSelected> = (state: RootState) => TSelected

export const applySelector = <TSelected>(selector: StateSelector<TSelected>): TSelected => {
  const state = store.getState()
  return selector(state)
}

type EqualityFn<T> = (a: T, b: T) => boolean

const refEquality: EqualityFn<unknown> = (a, b) => a === b

export const useSelector = <TSelected>(
  selector: StateSelector<TSelected>,
  equalityFn: EqualityFn<TSelected> = refEquality,
): TSelected => {
  const selectedState = useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    null,
    selector,
    equalityFn,
  )
  useDebugValue(selectedState)
  return selectedState
}
