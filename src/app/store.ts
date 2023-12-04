import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { merge } from '@/common/utils'
import assemblerReducer from '@/features/assembler/assemblerSlice'
import controllerReducer from '@/features/controller/controllerSlice'
import cpuReducer from '@/features/cpu/cpuSlice'
import editorReducer from '@/features/editor/editorSlice'
import exceptionReducer from '@/features/exception/exceptionSlice'
import ioReducer from '@/features/io/ioSlice'
import memoryReducer from '@/features/memory/memorySlice'

import { createActionObserver } from './actionObserver'
import { loadState as loadStateFromLocalStorage } from './localStorage'
import { getInitialStateToPersist } from './persist'
import { createStateObserver } from './stateObserver'
import { loadState as loadStateFromUrl } from './url'

// TODO: https://redux-toolkit.js.org/usage/migrating-rtk-2
// TODO: use `selectors` field in `createSlice`

// TODO: use `combineSlices`
const rootReducer = combineReducers({
  editor: editorReducer,
  assembler: assemblerReducer,
  controller: controllerReducer,
  memory: memoryReducer,
  cpu: cpuReducer,
  io: ioReducer,
  exception: exceptionReducer,
})

export type RootState = ReturnType<typeof rootReducer>

const getPreloadedState = (): Partial<RootState> => {
  const stateFromLocalStorage = loadStateFromLocalStorage()
  const stateFromUrl = loadStateFromUrl()
  // in case any future changes to the state structure
  return merge(getInitialStateToPersist(), stateFromLocalStorage, stateFromUrl)
}

const actionObserver = createActionObserver()
const stateObserver = createStateObserver()

export const store = Object.assign(
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      const defaultMiddleware = getDefaultMiddleware()
      return defaultMiddleware.prepend(stateObserver.middleware, actionObserver.middleware)
    },
    preloadedState: getPreloadedState(),
  }),
  {
    onAction: actionObserver.on,
    onState: stateObserver.on,
  },
)

export type Store = typeof store
