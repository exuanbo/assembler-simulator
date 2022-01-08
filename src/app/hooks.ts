import { TypedUseSelectorHook, useSelector as __useSelector } from 'react-redux'
import type { RootState } from './store'

export const useSelector: TypedUseSelectorHook<RootState> = __useSelector
