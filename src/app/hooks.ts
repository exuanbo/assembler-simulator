import { TypedUseSelectorHook, useSelector as __useSelector } from 'react-redux'
import type { RootState } from './store'
import { useConstant } from '@/common/hooks'

export const useSelector: TypedUseSelectorHook<RootState> = __useSelector

export const useLazilyInitializedSelector = <TSelected>(
  selectorFactory: () => (state: RootState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
): TSelected => {
  const selector = useConstant(selectorFactory)
  return useSelector(selector, equalityFn)
}
