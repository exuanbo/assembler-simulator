import { combineReducers, configureStore } from '@reduxjs/toolkit'
import editorReducer from '../features/editor/editorSlice'
import assemblerReducer from '../features/assembler/assemblerSlice'
import controllerReducer from '../features/controller/controllerSlice'
import memoryReducer from '../features/memory/memorySlice'
import cpuReducer from '../features/cpu/cpuSlice'
import sideEffect from './sideEffect'
import { loadState, saveState } from './localStorage'
import { debounce } from '../common/utils'

const rootReducer = combineReducers({
  editor: editorReducer,
  assembler: assemblerReducer,
  controller: controllerReducer,
  memory: memoryReducer,
  cpu: cpuReducer
})

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sideEffect),
  preloadedState: loadState()
})

store.subscribe(
  // TODO: should we debounce here?
  debounce(() => {
    const state = store.getState()
    saveState({
      editor: {
        ...state.editor,
        activeRange: undefined
      },
      controller: {
        isRunning: false,
        isSuspended: false,
        configuration: state.controller.configuration
      }
    })
  }, 100)
)

export type RootState = ReturnType<typeof rootReducer>
export type Dispatch = typeof store.dispatch
export type Store = typeof store

export default store
