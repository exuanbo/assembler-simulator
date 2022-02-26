import { useMemo } from 'react'
import { TypedUseSelectorHook, useSelector as __useSelector } from 'react-redux'
import type { RootState } from './store'

export const useSelector: TypedUseSelectorHook<RootState> = __useSelector

export const useLazilyInitializedSelector = <TSelected>(
  selectorFactory: () => (state: RootState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
): TSelected => {
  const selector = useMemo(selectorFactory, [])
  return useSelector(selector, equalityFn)
}
