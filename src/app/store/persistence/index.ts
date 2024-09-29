import { createSelector } from '@reduxjs/toolkit'

import { ary, isPlainObject, merge, mergeSafe, type PlainObject } from '@/common/utils'
import { controllerSlice } from '@/features/controller/controllerSlice'
import { editorSlice } from '@/features/editor/editorSlice'

import { createCombinedProvider } from './combinedProvider'

const provider = createCombinedProvider(ary(merge<PlainObject>, 2))(isPlainObject, {})

type PreloadedState = {
  [editorSlice.reducerPath]: ReturnType<typeof editorSlice.getInitialState>
  [controllerSlice.reducerPath]: ReturnType<typeof controllerSlice.getInitialState>
}

export const readStateFromPersistence = (): PreloadedState => {
  const persistedState = provider.read()
  // in case of future changes to the state shape
  return mergeSafe(
    {
      [editorSlice.reducerPath]: editorSlice.getInitialState(),
      [controllerSlice.reducerPath]: controllerSlice.getInitialState(),
    },
    persistedState,
  )
}

export const selectStateToPersist = createSelector(
  editorSlice.selectors.selectToPersist,
  controllerSlice.selectors.selectToPersist,
  (editorState, controllerState) => ({
    [editorSlice.reducerPath]: editorState,
    [controllerSlice.reducerPath]: controllerState,
  }),
)

type StateToPersist = ReturnType<typeof selectStateToPersist>

export const writeStateToPersistence = (state: StateToPersist) => provider.write(state)
