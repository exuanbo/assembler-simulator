import type { PreloadedState } from '@reduxjs/toolkit'
import { merge } from 'merge-anything'
import type { selectStateToPersist } from './selectors'
import type { RootState } from './store'
import { editorSlice } from '../features/editor/editorSlice'
import { controllerSlice } from '../features/controller/controllerSlice'
import { name } from '../../package.json'

const LOCAL_STORAGE_KEY = `persist:${name}`

type PersistedState = ReturnType<typeof selectStateToPersist> | Record<string, never>

const __loadState = (): PersistedState => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY)
    return JSON.parse(serializedState ?? '{}')
  } catch {
    return {}
  }
}

// in case any future changes to the state structure
const mergePersistedState = (persistedState: PersistedState): PreloadedState<RootState> =>
  merge(
    {
      editor: editorSlice.getInitialState(),
      controller: controllerSlice.getInitialState()
    },
    persistedState
  )

export const loadState = (): PreloadedState<RootState> | undefined => {
  const persistedState = __loadState()
  return mergePersistedState(persistedState)
}

export const saveState = (state: PersistedState): void => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState)
  } catch (err) {
    console.error(err)
  }
}
