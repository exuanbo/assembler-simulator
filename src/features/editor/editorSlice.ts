import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Line } from '@codemirror/text'
import type { RootState } from '../../app/store'
import type { SourceRange } from '../assembler/core/types'
import type { Statement } from '../assembler/core/parser'

type LineRange = Pick<Line, 'from' | 'to'>

interface EditorState {
  input: string
  breakpoints: LineRange[]
  activeRange: SourceRange | undefined
}

const DEFAULT_INPUT = `jmp start

db "Hello World!"
db 00

start:
	mov al, c0
	mov bl, 02
	mov cl, [bl]

loop:
	mov [al], cl
	inc al
	inc bl
	mov cl, [bl]
	cmp cl, 00
	jnz loop

end
`

const initialState: EditorState = {
  input: DEFAULT_INPUT,
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

export default editorSlice.reducer
