import { createSlice, PayloadAction, PayloadActionCreator } from '@reduxjs/toolkit'
import type { Line } from '@codemirror/text'
import type { RootState } from '../../app/store'
import { saveState } from '../../app/localStorage'
import { addActionListener } from '../../app/actionListener'
import type { SourceRange } from '../assembler/core/types'
import type { Statement } from '../assembler/core/parser'
import { samples } from './samples'

type LineRange = Pick<Line, 'from' | 'to'>

interface EditorState {
  input: string
  breakpoints: LineRange[]
  activeRange: SourceRange | undefined
}

const [helloWorld] = samples

const initialState: EditorState = {
  input: helloWorld.content,
  breakpoints: [],
  activeRange: undefined
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<{ value: string; isFromFile?: boolean }>) => {
      state.input = action.payload.value
    },
    addBreakpoint: (state, action: PayloadAction<LineRange>) => {
      state.breakpoints.push(action.payload)
    },
    removeBreakpoint: (state, action: PayloadAction<LineRange>) => {
      const lineRange = action.payload
      const targetIndex = state.breakpoints.findIndex(
        ({ from, to }) => lineRange.from === from && lineRange.to === to
      )
      if (targetIndex >= 0) {
        state.breakpoints.splice(targetIndex, 1)
      }
    },
    setActiveRange: (state, action: PayloadAction<Statement | undefined>) => {
      const statement = action.payload
      state.activeRange = statement?.range
    }
  }
})

export const selectEditortInput = (state: RootState): string => state.editor.input

export const selectEditorBreakpoints = (state: RootState): LineRange[] => state.editor.breakpoints

export const selectEditorActiveRange = (state: RootState): SourceRange | undefined =>
  state.editor.activeRange

export const {
  setInput: setEditorInput,
  addBreakpoint,
  removeBreakpoint,
  setActiveRange: setEditorActiveRange
} = editorSlice.actions

// persist state
;(
  [setEditorInput, addBreakpoint, removeBreakpoint] as Array<PayloadActionCreator<unknown>>
).forEach(actionCreator => {
  addActionListener(actionCreator, (_payload, api) => {
    saveState(api.getState())
  })
})

export default editorSlice.reducer
