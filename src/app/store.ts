import { PreloadedState, combineReducers, configureStore } from '@reduxjs/toolkit'
import editorReducer, { editorSlice } from '@/features/editor/editorSlice'
import assemblerReducer from '@/features/assembler/assemblerSlice'
import controllerReducer, { controllerSlice } from '@/features/controller/controllerSlice'
import memoryReducer from '@/features/memory/memorySlice'
import cpuReducer from '@/features/cpu/cpuSlice'
import ioReducer from '@/features/io/ioSlice'
import exceptionReducer from '@/features/exception/exceptionSlice'
import {
  loadState as loadStateFromLocalStorage,
  saveState as saveStateToLocalStorage
} from './localStorage'
import { loadState as loadStateFromUrl } from './url'
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

const getPreloadedState = (): PreloadedState<RootState> => {
  const stateFromLocalStorage = loadStateFromLocalStorage()
  const stateFromUrl = loadStateFromUrl()
  // in case any future changes to the state structure
  const persistedState = merge(
    {
      editor: editorSlice.getInitialState(),
      controller: controllerSlice.getInitialState()
    },
    stateFromLocalStorage,
    stateFromUrl
  )
  saveStateToLocalStorage(persistedState)
  return persistedState
}

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(watcher, actionListener),
  preloadedState: getPreloadedState()
})

export type Store = typeof store
export type StoreGetState = typeof store.getState
export type StoreDispatch = typeof store.dispatch

export default store
