import { name } from '@/../package.json'
import { isPlainObject } from '@/common/utils'

import type { PersistenceProvider } from '../types'

const LOCAL_STORAGE_KEY = `persist:${name}`

export const localStorageProvider: PersistenceProvider = {
  read: () => {
    try {
      const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (serializedState !== null) {
        const state: unknown = JSON.parse(serializedState)
        if (isPlainObject(state)) {
          return state
        }
      }
    } catch {
      // ignore error
    }
    return {}
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
