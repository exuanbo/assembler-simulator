import { configureStore } from '@reduxjs/toolkit'
import editorReducer from '../features/editor/editorSlice'
import assemblerReducer from '../features/assembler/assemblerSlice'
import controllerReducer from '../features/controller/controllerSlice'
import memoryReducer from '../features/memory/memorySlice'
import cpuReducer from '../features/cpu/cpuSlice'
import sideEffect from './sideEffect'

const store = configureStore({
  reducer: {
    editor: editorReducer,
    assembler: assemblerReducer,
    controller: controllerReducer,
    memory: memoryReducer,
    cpu: cpuReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sideEffect)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type Store = typeof store

export default store
