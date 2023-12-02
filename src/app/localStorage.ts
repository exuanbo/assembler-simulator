import { name } from '@/../package.json'

import type { PersistedState, StateToPersist } from './persist'

const LOCAL_STORAGE_KEY = `persist:${name}`

export const loadState = (): PersistedState => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (serializedState !== null) {
      return JSON.parse(serializedState)
    }
  } catch {
    // ignore error
  }
  return {}
}

export const saveState = (state: StateToPersist): void => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState)
  } catch {
    // ignore write error
  }
}
