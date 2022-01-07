import {
  TypedUseSelectorHook,
  useSelector as __useSelector,
  useDispatch as __useDispatch,
  useStore
} from 'react-redux'
import type { RootState, GetState, Dispatch } from './store'

export const useGetState = (): GetState => useStore().getState

export const useSelector: TypedUseSelectorHook<RootState> = __useSelector

export const useDispatch = () => __useDispatch<Dispatch>() // eslint-disable-line
