import type { Selector } from '@reduxjs/toolkit'
import { useDebugValue } from 'react'
import { useExternalStore } from 'use-external-store'

import { readonlyStore, type RootState } from '..'
import { useSyncExternalStoreWithSelector } from './useSyncExternalStoreWithSelector'

export const useSyncSelector = <Selection>(
  selector: Selector<RootState, Selection>,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection => {
  const selection = useSyncExternalStoreWithSelector(
    readonlyStore.subscribe,
    readonlyStore.getState,
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
  const selection = useExternalStore(readonlyStore, selector, isEqual)
  useDebugValue(selection)
  return selection
}
