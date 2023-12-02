import { createSelector } from '@reduxjs/toolkit'

import {
  controllerSlice,
  selectControllerStateToPersist,
} from '@/features/controller/controllerSlice'
import { editorSlice, selectEditorStateToPersist } from '@/features/editor/editorSlice'

import type { RootState } from './store'

type InitialStateToPersist = Pick<RootState, 'editor' | 'controller'>

export const getInitialStateToPersist = (): InitialStateToPersist => {
  return {
    editor: editorSlice.getInitialState(),
    controller: controllerSlice.getInitialState(),
  }
}

export const selectStateToPersist = createSelector(
  selectEditorStateToPersist,
  selectControllerStateToPersist,
  (editorState, controllerState) => ({
    editor: editorState,
    controller: controllerState,
  }),
)

export type StateToPersist = ReturnType<typeof selectStateToPersist>

export type PersistedState = StateToPersist | Record<string, never>
