import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { type ErrorObject, errorToPlainObject } from '@/common/error'

type ExceptionState = ErrorObject | null

const initialState = null as ExceptionState

export const exceptionSlice = createSlice({
  name: 'exception',
  initialState,
  reducers: {
    set: {
      reducer: (_, action: PayloadAction<ErrorObject>) => action.payload,
      prepare: (exception: unknown) => {
        if (exception instanceof Error) {
          return { payload: errorToPlainObject(exception) }
        }
        else {
          const error = new Error(`Uncaught ${JSON.stringify(exception)}`)
          return { payload: errorToPlainObject(error) }
        }
      },
    },
    clear: () => null,
  },
  selectors: {
    selectException: (state) => state,
  },
})

export const { set: setException, clear: clearException } = exceptionSlice.actions

export const { selectException } = exceptionSlice.selectors
