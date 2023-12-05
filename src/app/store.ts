import { combineSlices, configureStore } from '@reduxjs/toolkit'

import { merge } from '@/common/utils'
import { assemblerSlice } from '@/features/assembler/assemblerSlice'
import { controllerSlice } from '@/features/controller/controllerSlice'
import { cpuSlice } from '@/features/cpu/cpuSlice'
import { editorSlice } from '@/features/editor/editorSlice'
import { exceptionSlice } from '@/features/exception/exceptionSlice'
import { ioSlice } from '@/features/io/ioSlice'
import { memorySlice } from '@/features/memory/memorySlice'

import { createActionObserver } from './actionObserver'
import { loadState as loadStateFromLocalStorage } from './localStorage'
import { getInitialStateToPersist } from './persist'
import { createStateObserver } from './stateObserver'
import { loadState as loadStateFromUrl } from './url'

const rootReducer = combineSlices(
  editorSlice,
  assemblerSlice,
  controllerSlice,
  memorySlice,
  cpuSlice,
  ioSlice,
  exceptionSlice,
)

export type RootState = ReturnType<typeof rootReducer>

const getPreloadedState = (): Partial<RootState> => {
  const stateFromLocalStorage = loadStateFromLocalStorage()
  const stateFromUrl = loadStateFromUrl()
  // in case any future changes to the state structure
  return merge(getInitialStateToPersist(), stateFromLocalStorage, stateFromUrl)
}

const actionObserver = createActionObserver()
const stateObserver = createStateObserver<RootState>()

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware()
    return defaultMiddleware.prepend(stateObserver.middleware, actionObserver.middleware)
  },
  preloadedState: getPreloadedState(),
  enhancers: (getDefaultEnhancers) => {
    const defaultEnhancers = getDefaultEnhancers()
    return defaultEnhancers.concat(stateObserver.enhancer, actionObserver.enhancer)
  },
})
