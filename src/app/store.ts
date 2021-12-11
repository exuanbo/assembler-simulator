import { combineReducers, configureStore } from '@reduxjs/toolkit'
import editorReducer from '../features/editor/editorSlice'
import assemblerReducer from '../features/assembler/assemblerSlice'
import controllerReducer from '../features/controller/controllerSlice'
import memoryReducer from '../features/memory/memorySlice'
import cpuReducer from '../features/cpu/cpuSlice'
import actionListenerMiddleware from './actionListener'
import { loadState } from './localStorage'

const rootReducer = combineReducers({
  editor: editorReducer,
  assembler: assemblerReducer,
  controller: controllerReducer,
  memory: memoryReducer,
  cpu: cpuReducer
})

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(actionListenerMiddleware),
  preloadedState: loadState()
})

export type RootState = ReturnType<typeof rootReducer>
export type Dispatch = typeof store.dispatch
export type Store = typeof store

export default store
