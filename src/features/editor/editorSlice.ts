import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

interface EditorState {
  code: string
}

const initialState: EditorState = {
  code: ''
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload
    }
  }
})

export const selectCode = (state: RootState): string => state.editor.code

export const { setCode } = editorSlice.actions

export default editorSlice.reducer
