import { combineReducers, configureStore } from '@reduxjs/toolkit'
import editorReducer from '@/features/editor/editorSlice'
import assemblerReducer from '@/features/assembler/assemblerSlice'
import controllerReducer from '@/features/controller/controllerSlice'
import memoryReducer from '@/features/memory/memorySlice'
import cpuReducer from '@/features/cpu/cpuSlice'
import ioReducer from '@/features/io/ioSlice'
import exceptionReducer from '@/features/exception/exceptionSlice'
import { loadState as loadStateFromLocalStorage } from './localStorage'
import { loadState as loadStateFromUrl } from './url'
import { getInitialStateToPersist } from './persist'
import { actionListener } from './actionListener'
import { watcher } from './watcher'
import { merge } from '@/common/utils'

const rootReducer = combineReducers({
  editor: editorReducer,
  assembler: assemblerReducer,
  controller: controllerReducer,
  memory: memoryReducer,
  cpu: cpuReducer,
  io: ioReducer,
  exception: exceptionReducer
})

export type RootState = ReturnType<typeof rootReducer>

export type Selector<TSelected> = (state: RootState) => TSelected

const getPreloadedState = (): Partial<RootState> => {
  const stateFromLocalStorage = loadStateFromLocalStorage()
  const stateFromUrl = loadStateFromUrl()
  // in case any future changes to the state structure
  return merge(getInitialStateToPersist(), stateFromLocalStorage, stateFromUrl)
}

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => {
    const defaultMiddleware = getDefaultMiddleware()
    return defaultMiddleware.prepend(watcher, actionListener)
  },
  preloadedState: getPreloadedState()
})

export type Store = typeof store

export default store
