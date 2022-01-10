import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import type { EditorView } from '@codemirror/view'
import { LineRange, lineRangesEqual } from './codemirror/line'
import type { RootState } from '../../app/store'
import type { SourceRange, Statement } from '../assembler/core'
import { examples } from './examples'
import { range, curry2 } from '../../common/utils'

interface EditorState {
  input: string
  breakpoints: LineRange[]
  activeRange: SourceRange | null
}

const [helloWorld] = examples

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
      const targetLineRange = action.payload
      const targetIndex = state.breakpoints.findIndex(
        lineRange => lineRange.from > targetLineRange.from
      )
      if (targetIndex === -1) {
        state.breakpoints.push(targetLineRange)
      } else {
        state.breakpoints.splice(targetIndex, 0, targetLineRange)
      }
    },
    removeBreakpoint: (state, action: PayloadAction<LineRange>) => {
      const targetLineRange = action.payload
      const targetIndex = state.breakpoints.findIndex(lineRange =>
        lineRangesEqual(lineRange, targetLineRange)
      )
      state.breakpoints.splice(targetIndex, 1)
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

export const selectEditorActiveLinePos = curry2(
  createSelector(
    [(view?: EditorView) => view, (_, state: RootState) => state.editor.activeRange],
    (view, activeRange) =>
      view === undefined || activeRange === null
        ? undefined
        : [
            ...new Set(
              range(activeRange.from, activeRange.to).map(pos => {
                const line = view.state.doc.lineAt(pos)
                return line.from
              })
            )
          ]
  )
)

export const selectEditorStateToPersist = createSelector(
  selectEditortInput,
  selectEditorBreakpoints,
  (input, breakpoints) => ({ input, breakpoints })
)

export const {
  setInput: setEditorInput,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint,
  setActiveRange: setEditorActiveRange,
  clearActiveRange: clearEditorActiveRange
} = editorSlice.actions

export default editorSlice.reducer
