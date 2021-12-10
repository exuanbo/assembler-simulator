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

const __saveState = (state: PreloadedState<RootState>): void => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState)
  } catch (err) {
    console.error(err)
  }
}

export const saveState = (state: RootState): void => {
  __saveState({
    editor: {
      ...state.editor,
      activeRange: undefined
    },
    controller: {
      isRunning: false,
      isSuspended: false,
      configuration: state.controller.configuration
    }
  })
}
