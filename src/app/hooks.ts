import { TypedUseSelectorHook, useSelector, shallowEqual, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAppShallowEqualSelector = <TSelected>(
  selector: (state: RootState) => TSelected
): TSelected => useSelector(selector, shallowEqual)

export const useAppDispatch = () => useDispatch<AppDispatch>() // eslint-disable-line
