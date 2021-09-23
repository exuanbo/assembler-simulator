import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { SourceRange } from '../assembler/core/types'
import type { Statement } from '../assembler/core/parser'

interface EditorState {
  input: string
  activeRange: SourceRange | undefined
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
  activeRange: undefined
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload
    },
    setActiveRange: (state, action: PayloadAction<Statement | undefined>) => {
      const statement = action.payload
      state.activeRange = statement?.range
    }
  }
})

export const selectEditortInput = (state: RootState): string => state.editor.input

export const selectEditorActiveRange = (state: RootState): SourceRange | undefined =>
  state.editor.activeRange

export const { setInput: setEditorInput, setActiveRange: setEditorActiveRange } =
  editorSlice.actions

export default editorSlice.reducer
