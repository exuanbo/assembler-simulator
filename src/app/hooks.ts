import { TypedUseSelectorHook, useSelector, shallowEqual, useDispatch, useStore } from 'react-redux'
import type { Store, RootState } from './store'

export const useAppStore = (): Store => useStore()

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAppShallowEqualSelector = <TSelected>(
  selector: (state: RootState) => TSelected
): TSelected => useSelector(selector, shallowEqual)

export const useAppDispatch = () => useDispatch<Store['dispatch']>() // eslint-disable-line
