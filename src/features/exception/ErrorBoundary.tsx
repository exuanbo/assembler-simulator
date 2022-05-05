import { ReactNode, Component } from 'react'
import { useStore } from '@/app/hooks'
import { setException } from './exceptionSlice'
import { errorToPlainObject } from '@/common/utils'

type ErrorHandler = (err: Error) => void

interface ErrorBoundaryComponentProps {
  onError: ErrorHandler
  children: ReactNode
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryComponentProps> {
  public declare static displayName?: string

  public componentDidCatch(err: Error): void {
    this.props.onError(errorToPlainObject(err))
  }

  public render(): ReactNode {
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

  const handleError: ErrorHandler = err => {
    const errorObject = errorToPlainObject(err)
    store.dispatch(setException(errorObject))
  }

  return <ErrorBoundaryComponent onError={handleError}>{children}</ErrorBoundaryComponent>
}

if (import.meta.env.DEV) {
  ErrorBoundary.displayName = 'ErrorBoundaryWrapper'
}

export default ErrorBoundary
