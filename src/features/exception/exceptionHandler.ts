import type { Middleware, PayloadAction } from '@reduxjs/toolkit'
import { setException } from './exceptionSlice'
import { errorToPlainObject } from '@/common/utils'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ExceptionHandler extends Middleware {}

const createExceptionHandler = (): ExceptionHandler => {
  const exceptionHandler: ExceptionHandler = _api => next => (action: PayloadAction<unknown>) => {
    if (action.type === setException.type) {
      const exception = action.payload
      if (exception instanceof Error) {
        return next(setException(errorToPlainObject(exception)))
      } else {
        console.error('Uncaught', exception)
        const error = new Error(`Uncaught ${JSON.stringify(exception)}`)
        return next(setException(errorToPlainObject(error)))
      }
    }
    return next(action)
  }
  return exceptionHandler
}

export const exceptionHandler = createExceptionHandler()
