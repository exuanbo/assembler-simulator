import {
  TypedUseSelectorHook,
  shallowEqual,
  useSelector as __useSelector,
  useDispatch as __useDispatch,
  useStore
} from 'react-redux'
import type { RootState, GetState, Dispatch } from './store'

export const useGetState = (): GetState => useStore().getState

export const useSelector: TypedUseSelectorHook<RootState> = __useSelector

export const useShallowEqualSelector = <TSelected>(
  selector: (state: RootState) => TSelected
): TSelected => __useSelector(selector, shallowEqual)

export const useDispatch = () => __useDispatch<Dispatch>() // eslint-disable-line
