import {
  TypedUseSelectorHook,
  useStore as __useStore,
  useSelector as __useSelector
} from 'react-redux'
import type { RootState, Store } from './store'

type TypedUseStoreHook = () => Store

export const useStore: TypedUseStoreHook = __useStore

export const useSelector: TypedUseSelectorHook<RootState> = __useSelector
