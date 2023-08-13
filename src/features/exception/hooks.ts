import { useEffect } from 'react'
import { store } from '@/app/store'
import { setException } from './exceptionSlice'

export const useGlobalExceptionHandler = (): void => {
  useEffect(() => {
    const handleError = (event: ErrorEvent): void => {
      store.dispatch(setException(event.error))
    }
    const handlePromiseRejection = (event: PromiseRejectionEvent): void => {
      store.dispatch(setException(event.reason))
    }
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handlePromiseRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handlePromiseRejection)
    }
  }, [])
}
