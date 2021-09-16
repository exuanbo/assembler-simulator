import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { Statement } from '../assembler/core/parser'

interface ActiveRange {
  from: number
  to: number
}

interface EditorState {
  input: string
  activeRange: ActiveRange | null
}

const DEFAULT_INPUT = `mov al, c0
mov bl, 50
mov cl, [bl]
jmp loop

check:
	cmp cl, 00
	jz done

loop:
	mov [al], cl
	inc al
	inc bl
	mov cl, [bl]
	jmp check

org 50
	db "Hello World!"

done:
	end
`

const initialState: EditorState = {
  input: DEFAULT_INPUT,
  activeRange: null
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload
    },
    setActiveRange: (state, action: PayloadAction<Statement | null>) => {
      const statement = action.payload
      state.activeRange =
        statement !== null ? (({ start, end }) => ({ from: start, to: end }))(statement) : null
    }
  }
})

export const selectEditortInput = (state: RootState): string => state.editor.input

export const selectEditorActiveRange = (state: RootState): ActiveRange | null =>
  state.editor.activeRange

export const { setInput: setEditorInput, setActiveRange: setEditorActiveRange } =
  editorSlice.actions

export default editorSlice.reducer
