import { ReactNode, Component } from 'react'
import { useStore } from '@/app/hooks'
import { setUnexpectedError } from './unexpectedErrorSlice'
import { errorToPlainObject } from '@/common/utils'

type ErrorHandler = (err: Error) => void

interface ErrorBoundaryComponentProps {
  onError: ErrorHandler
  children: ReactNode
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryComponentProps> {
  public declare static displayName: string | undefined

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
    store.dispatch(setUnexpectedError(errorToPlainObject(err)))
  }

  return <ErrorBoundaryComponent onError={handleError}>{children}</ErrorBoundaryComponent>
}

if (import.meta.env.DEV) {
  ErrorBoundary.displayName = 'ErrorBoundaryWrapper'
}

export default ErrorBoundary
