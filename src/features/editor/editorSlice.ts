import type { EditorView } from '@codemirror/view'
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { fromFalsy, fromNullable } from '@/common/maybe'
import type { SourceRange, Statement } from '@/features/assembler/core'

import { type LineLoc, lineRangesEqual } from './codemirror/text'
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
    setMessage: (state, action: PayloadAction<EditorMessage | null>) => {
      state.message = action.payload
    },
    clearMessage: (state) => {
      state.message = null
    },
  },
  selectors: {
    selectEditorInput: (state) => state.input,
    selectEditorHighlightLinePos: createSelector(
      [
        (state: EditorState) => state.highlightRange,
        (_: EditorState, view: EditorView) => view.state.doc,
      ],
      (highlightRange, doc) =>
        fromNullable(highlightRange).chain((range) => {
          const linePos: number[] = []
          const rangeTo = Math.min(range.to, doc.length)
          for (let pos = range.from; pos < rangeTo; pos++) {
            const line = doc.lineAt(pos)
            if (!linePos.includes(line.from)) {
              linePos.push(line.from)
            }
          }
          return fromFalsy(linePos.length && linePos)
        }),
    ),
    selectEditorBreakpoints: (state) => state.breakpoints,
    selectEditorMessage: (state) => state.message,
    selectEditorStateToPersist: createSelector(
      (state: EditorState) => state.input,
      (state: EditorState) => state.breakpoints,
      (input, breakpoints) => ({ input, breakpoints }),
    ),
  },
})

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

export const {
  selectEditorInput,
  selectEditorHighlightLinePos,
  selectEditorBreakpoints,
  selectEditorMessage,
  selectEditorStateToPersist,
} = editorSlice.selectors
