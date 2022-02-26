import { createSelector } from '@reduxjs/toolkit'
import { selectEditorStateToPersist } from '@/features/editor/editorSlice'
import { selectControllerStateToPersist } from '@/features/controller/controllerSlice'

export const selectStateToPersist = createSelector(
  selectEditorStateToPersist,
  selectControllerStateToPersist,
  (editorState, controllerState) => ({
    editor: editorState,
    controller: controllerState
  })
)

export type StateToPersist = ReturnType<typeof selectStateToPersist>
