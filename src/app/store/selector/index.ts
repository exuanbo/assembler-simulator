/* eslint-disable @typescript-eslint/unbound-method */

import type { Selector } from '@reduxjs/toolkit'
import { useDebugValue } from 'react'

import { type RootState, store } from '..'
import { useSyncExternalStoreWithSelector } from './useSyncExternalStoreWithSelector'

type EqualityFn<T> = (a: T, b: T) => boolean

const refEquality: EqualityFn<unknown> = (a, b) => a === b

export const useSelector = <Selected>(
  selector: Selector<RootState, Selected>,
  equalityFn: EqualityFn<Selected> = refEquality,
): Selected => {
  const selectedState = useSyncExternalStoreWithSelector(
    store.subscribeChange,
    store.getState,
    selector,
    equalityFn,
  )
  useDebugValue(selectedState)
  return selectedState
}
