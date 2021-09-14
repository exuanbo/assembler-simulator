import { TypedUseSelectorHook, useSelector, shallowEqual, useDispatch, useStore } from 'react-redux'
import type { RootState, AppDispatch, Store } from './store'

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAppShallowEqualSelector = <TSelected>(
  selector: (state: RootState) => TSelected
): TSelected => useSelector(selector, shallowEqual)

export const useAppDispatch = () => useDispatch<AppDispatch>() // eslint-disable-line

export const useAppStore = (): Store => useStore()
