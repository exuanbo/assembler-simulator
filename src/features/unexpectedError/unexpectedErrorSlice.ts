import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'

type UnexpectedErrorState = Error | null

const initialState = null as UnexpectedErrorState

export const unexpectedErrorSlice = createSlice({
  name: 'unexpectedError',
  initialState,
  reducers: {
    set: (_, action: PayloadAction<Error>) => action.payload,
    reset: () => null
  }
})

export const selectUnexpectedError = (state: RootState): UnexpectedErrorState =>
  state.unexpectedError

export const { set: setUnexpectedError, reset: resetUnexpectedError } = unexpectedErrorSlice.actions

export default unexpectedErrorSlice.reducer
