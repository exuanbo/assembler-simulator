import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'

type ExceptionState = Error | null

const initialState = null as ExceptionState

export const exceptionSlice = createSlice({
  name: 'exception',
  initialState,
  reducers: {
    set: (_, action: PayloadAction<unknown>) => {
      // converted to `Error` object in middleware `exceptionHandler`
      return action.payload as Error
    },
    clear: () => null
  }
})

export const selectException = (state: RootState): ExceptionState => state.exception

export const { set: setException, clear: clearException } = exceptionSlice.actions

export default exceptionSlice.reducer
