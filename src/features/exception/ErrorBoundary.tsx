import { Component, type ReactNode, useCallback } from 'react'

import { store } from '@/app/store'

import { setException } from './exceptionSlice'

type ErrorHandler = (error: Error) => void

interface ErrorBoundaryComponentProps {
  onError: ErrorHandler
  children: ReactNode
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryComponentProps> {
  public declare static displayName?: string

  public override componentDidCatch(error: Error): void {
    this.props.onError(error)
  }

  public override render(): ReactNode {
    return this.props.children
  }
}

if (import.meta.env.DEV) {
  ErrorBoundaryComponent.displayName = 'ErrorBoundary'
}

interface Props {
  children: ReactNode
}

const ErrorBoundary = ({ children }: Props): JSX.Element => {
  const handleError = useCallback<ErrorHandler>((error) => {
    store.dispatch(setException(error))
  }, [])

  return <ErrorBoundaryComponent onError={handleError}>{children}</ErrorBoundaryComponent>
}

if (import.meta.env.DEV) {
  ErrorBoundary.displayName = 'ErrorBoundaryWrapper'
}

export default ErrorBoundary
