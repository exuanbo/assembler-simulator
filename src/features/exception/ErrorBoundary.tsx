import { Component, type FC, type PropsWithChildren, useCallback } from 'react'

import { store } from '@/app/store'

import { setException } from './exceptionSlice'

type ErrorHandler = (error: Error) => void

type ErrorBoundaryComponentProps = PropsWithChildren<{
  onError: ErrorHandler
}>

class ErrorBoundaryComponent extends Component<ErrorBoundaryComponentProps> {
  public declare static displayName?: string

  public override componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  public override render() {
    return this.props.children
  }
}

if (import.meta.env.DEV) {
  ErrorBoundaryComponent.displayName = 'ErrorBoundary'
}

const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  const handleError = useCallback<ErrorHandler>((error) => {
    store.dispatch(setException(error))
  }, [])

  return <ErrorBoundaryComponent onError={handleError}>{children}</ErrorBoundaryComponent>
}

if (import.meta.env.DEV) {
  ErrorBoundary.displayName = 'ErrorBoundaryWrapper'
}

export default ErrorBoundary
