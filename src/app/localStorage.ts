import type { PreloadedState } from '@reduxjs/toolkit'
import type { StateToPersist } from './selectors'
import type { RootState } from './store'
import { editorSlice } from '@/features/editor/editorSlice'
import { controllerSlice } from '@/features/controller/controllerSlice'
import { merge } from '@/common/utils'
import { name } from '../../package.json'

const LOCAL_STORAGE_KEY = `persist:${name}`

type PersistedState = StateToPersist | Record<string, never>

const __loadState = (): PersistedState => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY)
    return JSON.parse(serializedState ?? '{}')
  } catch {
    return {}
  }
}

export const loadState = (): PreloadedState<RootState> => {
  const persistedState = __loadState()
  // in case any future changes to the state structure
  return merge(
    {
      editor: editorSlice.getInitialState(),
      controller: controllerSlice.getInitialState()
    },
    persistedState
  )
}

export const saveState = (state: StateToPersist): void => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState)
  } catch (err) {
    // is there a better way to handle this?
    console.error(err)
  }
}
