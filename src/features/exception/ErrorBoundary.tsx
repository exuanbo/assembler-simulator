import { ReactNode, Component, useCallback } from 'react'
import { useStore } from '@/app/hooks'
import { setException } from './exceptionSlice'
import { errorToPlainObject } from '@/common/utils'

type ErrorHandler = (error: Error) => void

interface ErrorBoundaryComponentProps {
  onError: ErrorHandler
  children: ReactNode
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryComponentProps> {
  public declare static displayName?: string

  public override componentDidCatch(error: Error): void {
    this.props.onError(errorToPlainObject(error))
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
  const store = useStore()

  const handleError = useCallback<ErrorHandler>(error => {
    const errorObject = errorToPlainObject(error)
    store.dispatch(setException(errorObject))
  }, [])

  return <ErrorBoundaryComponent onError={handleError}>{children}</ErrorBoundaryComponent>
}

if (import.meta.env.DEV) {
  ErrorBoundary.displayName = 'ErrorBoundaryWrapper'
}

export default ErrorBoundary
