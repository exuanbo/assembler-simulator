import { configureStore } from '@reduxjs/toolkit'
import editorReducer from '../features/editor/editorSlice'
import assemblerReducer from '../features/assembler/assemblerSlice'
import memoryReducer from '../features/memory/memorySlice'

const store = configureStore({
  reducer: {
    editor: editorReducer,
    assembler: assemblerReducer,
    memory: memoryReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
