import { combineReducers, configureStore } from '@reduxjs/toolkit'
import editorReducer from '../features/editor/editorSlice'
import assemblerReducer from '../features/assembler/assemblerSlice'
import controllerReducer from '../features/controller/controllerSlice'
import memoryReducer from '../features/memory/memorySlice'
import cpuReducer from '../features/cpu/cpuSlice'
import ioReducer from '../features/io/ioSlice'
import actionListenerMiddleware from './actionListener'
import { loadState } from './localStorage'
import { createWatch } from './watch'

const rootReducer = combineReducers({
  editor: editorReducer,
  assembler: assemblerReducer,
  controller: controllerReducer,
  memory: memoryReducer,
  cpu: cpuReducer,
  io: ioReducer
})

export type RootState = ReturnType<typeof rootReducer>

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(actionListenerMiddleware),
  preloadedState: loadState()
})

export default store
export type Store = typeof store

export const { getState, dispatch } = store
export type Dispatch = typeof dispatch

export const watch = createWatch(store)
