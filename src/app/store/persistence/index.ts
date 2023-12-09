import { createSelector } from '@reduxjs/toolkit'
import type { Test as TypeTest } from 'ts-toolbelt'

import { merge } from '@/common/utils'
import { controllerSlice } from '@/features/controller/controllerSlice'
import { editorSlice } from '@/features/editor/editorSlice'

import { getCombinedProvider } from './combinedProvider'
import type { PersistenceProvider } from './types'

const provider = getCombinedProvider()

type PreloadedState = {
  [editorSlice.reducerPath]: ReturnType<typeof editorSlice.getInitialState>
  [controllerSlice.reducerPath]: ReturnType<typeof controllerSlice.getInitialState>
}

export const readStateFromPersistence = (): PreloadedState => {
  const persistedState = provider.read()
  // in case of future changes to the state shape
  return merge(
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

export const writeStateToPersistence: PersistenceProvider<StateToPersist>['write'] = provider.write

if (import.meta.env.NEVER) {
  const { checkType, checkTypes } = await import('@/common/utils')
  checkTypes([
    checkType<keyof PreloadedState, keyof StateToPersist, TypeTest.Pass>(),
    checkType<keyof StateToPersist, keyof PreloadedState, TypeTest.Pass>(),
  ])
}
