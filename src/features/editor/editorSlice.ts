import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { LineRange, lineRangesEqual } from './codemirror/line'
import type { RootState } from '../../app/store'
import type { SourceRange } from '../assembler/core/types'
import type { Statement } from '../assembler/core/parser'
import { samples } from './samples'

interface EditorState {
  input: string
  breakpoints: LineRange[]
  activeRange: SourceRange | null
}

const [helloWorld] = samples

const initialState: EditorState = {
  input: helloWorld.content,
  breakpoints: [],
  activeRange: null
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<{ value: string; isFromFile?: boolean }>) => {
      state.input = action.payload.value
    },
    setBreakpoints: (state, action: PayloadAction<LineRange[]>) => {
      state.breakpoints = action.payload
    },
    addBreakpoint: (state, action: PayloadAction<LineRange>) => {
      const lineRange = action.payload
      const hasDuplicate = state.breakpoints.some(breakpointLineRange =>
        lineRangesEqual(breakpointLineRange, lineRange)
      )
      if (!hasDuplicate) {
        state.breakpoints.push(action.payload)
      }
    },
    removeBreakpoint: (state, action: PayloadAction<LineRange>) => {
      const lineRange = action.payload
      const targetIndex = state.breakpoints.findIndex(breakpointLineRange =>
        lineRangesEqual(breakpointLineRange, lineRange)
      )
      // TODO: could this be negative?
      if (targetIndex >= 0) {
        state.breakpoints.splice(targetIndex, 1)
      }
    },
    setActiveRange: (state, action: PayloadAction<Statement>) => {
      const statement = action.payload
      state.activeRange = statement.range
    },
    clearActiveRange: state => {
      state.activeRange = null
    }
  }
})

export const selectEditortInput = (state: RootState): string => state.editor.input

export const selectEditorBreakpoints = (state: RootState): LineRange[] => state.editor.breakpoints

export const selectEditorActiveRange = (state: RootState): SourceRange | undefined => {
  const { activeRange } = state.editor
  return activeRange === null ? undefined : activeRange
}

export const selectEditorStateToPersist = (
  state: RootState
): Pick<EditorState, 'input' | 'breakpoints'> =>
  (({ input, breakpoints }) => ({ input, breakpoints }))(state.editor)

export const {
  setInput: setEditorInput,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint,
  setActiveRange: setEditorActiveRange,
  clearActiveRange: clearEditorActiveRange
} = editorSlice.actions

export default editorSlice.reducer
