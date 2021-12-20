import { createSelector } from '@reduxjs/toolkit'
import { selectEditorStateToPersist } from '../features/editor/editorSlice'
import { selectControllerStateToPersist } from '../features/controller/controllerSlice'

export type PersistedState =
  | {
      editor: ReturnType<typeof selectEditorStateToPersist>
      controller: ReturnType<typeof selectControllerStateToPersist>
    }
  | Record<string, never>

export const selectStateToPersist = createSelector(
  selectEditorStateToPersist,
  selectControllerStateToPersist,
  (editorState, controllerState) => ({
    editor: editorState,
    controller: controllerState
  })
)
