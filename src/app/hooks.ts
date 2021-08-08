import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAppDispatch = () => useDispatch<AppDispatch>() // eslint-disable-line
