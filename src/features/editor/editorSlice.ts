import type { EditorView } from '@codemirror/view'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { curryRight2 } from '@/common/utils'
import type { SourceRange, Statement } from '@/features/assembler/core'

import { LineLoc, lineRangesEqual } from './codemirror/text'
import { examples } from './examples'

export enum MessageType {
  Info,
  Warning,
  Error,
}

export interface EditorMessage {
  type: MessageType
  content: string
}

interface EditorState {
  input: string
  highlightRange: SourceRange | null
  breakpoints: LineLoc[]
  message: EditorMessage | null
}

const initialState: EditorState = {
  input: examples[/* Visual Display Unit */ 4].content,
  highlightRange: null,
  breakpoints: [],
  message: null,
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setInput: {
      reducer: (state, action: PayloadAction<{ value: string }>) => {
        state.input = action.payload.value
      },
      prepare: (payload: { value: string; isFromFile?: boolean }) => {
        const { value, isFromFile = false } = payload
        return {
          payload: { value, isFromFile },
        }
      },
    },
    setHighlightRange: (state, action: PayloadAction<Statement>) => {
      const statement = action.payload
      state.highlightRange = statement.range
    },
    clearHighlightRange: (state) => {
      state.highlightRange = null
    },
    setBreakpoints: (state, action: PayloadAction<LineLoc[]>) => {
      state.breakpoints = action.payload
    },
    addBreakpoint: (state, action: PayloadAction<LineLoc>) => {
      const targetLineLoc = action.payload
      const targetIndex = state.breakpoints.findIndex(
        (lineLoc) => lineLoc.from > targetLineLoc.from,
      )
      if (targetIndex === -1) {
        state.breakpoints.push(targetLineLoc)
      } else {
        state.breakpoints.splice(targetIndex, 0, targetLineLoc)
      }
    },
    removeBreakpoint: (state, action: PayloadAction<LineLoc>) => {
      const targetLineLoc = action.payload
      const targetIndex = state.breakpoints.findIndex((lineLoc) =>
        lineRangesEqual(lineLoc, targetLineLoc),
      )
      state.breakpoints.splice(targetIndex, 1)
    },
    setMessage: (state, action: PayloadAction<EditorMessage>) => {
      state.message = action.payload
    },
    clearMessage: (state) => {
      state.message = null
    },
  },
})

export const selectEditorInput = (state: RootState): string => state.editor.input

const selectHighlightRange = (state: RootState): SourceRange | null => state.editor.highlightRange

export const selectEditorHighlightLinePos = curryRight2(
  createSelector([selectHighlightRange, (_, view: EditorView) => view], (highlightRange, view) => {
    if (highlightRange === null) {
      return undefined
    }
    const linePos: number[] = []
    for (let pos = highlightRange.from; pos < highlightRange.to; pos++) {
      if (pos < view.state.doc.length) {
        const line = view.state.doc.lineAt(pos)
        if (!linePos.includes(line.from)) {
          linePos.push(line.from)
        }
      }
    }
    return linePos.length > 0 ? linePos : undefined
  }),
)

export const selectEditorBreakpoints = (state: RootState): LineLoc[] => state.editor.breakpoints

export const selectEditorMessage = (state: RootState): EditorMessage | null => state.editor.message

export const selectEditorStateToPersist = createSelector(
  selectEditorInput,
  selectEditorBreakpoints,
  (input, breakpoints) => ({ input, breakpoints }),
)

export const {
  setInput: setEditorInput,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint,
  setHighlightRange: setEditorHighlightRange,
  clearHighlightRange: clearEditorHighlightRange,
  setMessage: setEditorMessage,
  clearMessage: clearEditorMessage,
} = editorSlice.actions

export default editorSlice.reducer
