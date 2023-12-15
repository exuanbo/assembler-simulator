import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

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
  breakpoints: LineLoc[]
  message: EditorMessage | null
}

const initialState: EditorState = {
  input: examples[/* Visual Display Unit */ 4].content,
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
    selectEditorBreakpoints: (state) => state.breakpoints,
    selectEditorMessage: (state) => state.message,
    selectToPersist: createSelector(
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
  setMessage: setEditorMessage,
  clearMessage: clearEditorMessage,
} = editorSlice.actions

export const { selectEditorInput, selectEditorBreakpoints, selectEditorMessage } =
  editorSlice.selectors
