import { combineSlices, configureStore } from '@reduxjs/toolkit'

import { assemblerSlice } from '@/features/assembler/assemblerSlice'
import { controllerSlice } from '@/features/controller/controllerSlice'
import { cpuSlice } from '@/features/cpu/cpuSlice'
import { editorSlice } from '@/features/editor/editorSlice'
import { exceptionSlice } from '@/features/exception/exceptionSlice'
import { ioSlice } from '@/features/io/ioSlice'
import { memorySlice } from '@/features/memory/memorySlice'

import { createSelectorEnhancer } from './enhancers/getStateWithSelector'
import { subscribeChange } from './enhancers/subscribeChange'
import { createActionObserver } from './observers/actionObserver'
import { createStateObserver } from './observers/stateObserver'
import {
  readStateFromPersistence,
  selectStateToPersist,
  writeStateToPersistence,
} from './persistence'

export { useSelector } from './selector'

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

const getStateWithSelector = createSelectorEnhancer<RootState>()

const stateObserver = createStateObserver<RootState>()
const actionObserver = createActionObserver()

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware()
    return defaultMiddleware.prepend(stateObserver.middleware, actionObserver.middleware)
  },
  devTools: import.meta.env.DEV,
  preloadedState: readStateFromPersistence(),
  enhancers: (getDefaultEnhancers) => {
    const defaultEnhancers = getDefaultEnhancers({ autoBatch: false })
    return defaultEnhancers
      .concat(subscribeChange)
      .concat(getStateWithSelector)
      .concat(stateObserver.enhancer, actionObserver.enhancer)
  },
})

store.onState(selectStateToPersist).subscribe(writeStateToPersistence)
