import type { PreloadedState } from '@reduxjs/toolkit'
import type { RootState } from './store'

const LOCAL_STORAGE_KEY = 'persist:root'

export const loadState = (): PreloadedState<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY)
    return serializedState === null ? undefined : JSON.parse(serializedState)
  } catch {
    return undefined
  }
}

export const saveState = (state: PreloadedState<RootState>): void => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState)
  } catch (err) {
    console.error(err)
  }
}
