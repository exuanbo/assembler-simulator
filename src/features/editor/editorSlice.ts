import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

interface EditorState {
  input: string
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
  input: DEFAULT_INPUT
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload
    }
  }
})

export const selectEditortInput = (state: RootState): string => state.editor.input

export const { setInput: setEditorInput } = editorSlice.actions

export default editorSlice.reducer
