/* eslint-disable @typescript-eslint/unbound-method */

import type { Selector } from '@reduxjs/toolkit'
import { useDebugValue } from 'react'

import { type RootState, store } from '..'
import { useSyncExternalStoreWithSelector } from './useSyncExternalStoreWithSelector'

type StateSelector<TSelected> = Selector<RootState, TSelected>

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
    store.subscribeChange,
    store.getState,
    selector,
    equalityFn,
  )
  useDebugValue(selectedState)
  return selectedState
}
