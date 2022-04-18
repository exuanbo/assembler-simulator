import {
  TypedUseSelectorHook,
  useStore as __useStore,
  useSelector as __useSelector
} from 'react-redux'
import type { RootState, Store } from './store'
import { useConstant } from '@/common/hooks'

type TypedUseStoreHook = () => Store

export const useStore: TypedUseStoreHook = __useStore

export const useSelector: TypedUseSelectorHook<RootState> = __useSelector

export const useLazilyInitializedSelector = <TSelected>(
  selectorFactory: () => (state: RootState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
): TSelected => {
  const selector = useConstant(selectorFactory)
  return useSelector(selector, equalityFn)
}
