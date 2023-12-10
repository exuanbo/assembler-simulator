import { name } from '@/../package.json'

import type { GetPersistenceProvider } from '../types'

const LOCAL_STORAGE_KEY = `persist:${name}`

export const getLocalStorageProvider: GetPersistenceProvider = (validate, fallbackState) => {
  return {
    read: () => {
      try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (serializedState !== null) {
          const state: unknown = JSON.parse(serializedState)
          if (validate(state)) {
            return state
          }
        }
      } catch {
        // ignore error
      }
      return fallbackState
    },

    write: (state) => {
      try {
        const serializedState = JSON.stringify(state)
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState)
      } catch {
        // ignore write error
      }
    },
  }
}
