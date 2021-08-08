import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

interface EditorState {
  input: string
}

const initialState: EditorState = {
  input: ''
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

export const selectInput = (state: RootState): string => state.editor.input

export const { setInput } = editorSlice.actions

export default editorSlice.reducer
