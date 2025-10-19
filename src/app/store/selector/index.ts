import type { Selector } from '@reduxjs/toolkit'
import { useDebugValue } from 'react'
import { useExternalStore } from 'use-external-store'

import { readonlyStore as store, type RootState } from '..'
import { useSyncExternalStoreWithSelector } from './useSyncExternalStoreWithSelector'

export const useSyncSelector = <Selection>(
  selector: Selector<RootState, Selection>,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection => {
  const selection = useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    selector,
    isEqual,
  )
  useDebugValue(selection)
  return selection
}

export const useSelector = <Selection>(
  selector: Selector<RootState, Selection>,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection => {
  const selection = useExternalStore(store, selector, isEqual)
  useDebugValue(selection)
  return selection
}
