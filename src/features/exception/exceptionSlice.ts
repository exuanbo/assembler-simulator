import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import { errorToPlainObject } from '@/common/utils'

type ExceptionState = Error | null

const initialState = null as ExceptionState

export const exceptionSlice = createSlice({
  name: 'exception',
  initialState,
  reducers: {
    set: {
      reducer: (_, action: PayloadAction<Error>) => action.payload,
      prepare: (exception: unknown) => {
        if (exception instanceof Error) {
          return { payload: errorToPlainObject(exception) }
        } else {
          const error = new Error(`Uncaught ${JSON.stringify(exception)}`)
          return { payload: errorToPlainObject(error) }
        }
      },
    },
    clear: () => null,
  },
})

export const selectException = (state: RootState): ExceptionState => state.exception

export const { set: setException, clear: clearException } = exceptionSlice.actions

export default exceptionSlice.reducer
