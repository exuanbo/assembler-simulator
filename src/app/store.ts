import { configureStore } from '@reduxjs/toolkit'
import editorReducer from '../features/editor/editorSlice'
import assemblerReducer from '../features/assembler/assemblerSlice'
import memoryReducer from '../features/memory/memorySlice'
import cpuReducer from '../features/cpu/cpuSlice'

const store = configureStore({
  reducer: {
    editor: editorReducer,
    assembler: assemblerReducer,
    memory: memoryReducer,
    cpu: cpuReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
