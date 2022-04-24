import { combineReducers, configureStore } from '@reduxjs/toolkit'
import editorReducer from '@/features/editor/editorSlice'
import assemblerReducer from '@/features/assembler/assemblerSlice'
import controllerReducer from '@/features/controller/controllerSlice'
import memoryReducer from '@/features/memory/memorySlice'
import cpuReducer from '@/features/cpu/cpuSlice'
import ioReducer from '@/features/io/ioSlice'
import unexpectedErrorReducer from '@/features/unexpectedError/unexpectedErrorSlice'
import { actionListener } from './actionListener'
import { watcher } from './watcher'
import { loadState } from './localStorage'

const rootReducer = combineReducers({
  editor: editorReducer,
  assembler: assemblerReducer,
  controller: controllerReducer,
  memory: memoryReducer,
  cpu: cpuReducer,
  io: ioReducer,
  unexpectedError: unexpectedErrorReducer
})

export type RootState = ReturnType<typeof rootReducer>

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(actionListener, watcher),
  preloadedState: loadState()
})

export type Store = typeof store

export default store
