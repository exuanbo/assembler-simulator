import { ReactNode, Component } from 'react'
import { ConnectedProps, connect } from 'react-redux'
import { setUnexpectedError } from './unexpectedErrorSlice'
import { errorToPlainObject } from '@/common/utils'

const connector = connect(null, { handleError: setUnexpectedError })

interface Props extends ConnectedProps<typeof connector> {
  children: ReactNode
}

class __ErrorBoundary extends Component<Props> {
  public declare static displayName: string | undefined

  public componentDidCatch(err: Error): void {
    this.props.handleError(errorToPlainObject(err))
  }

  public render(): ReactNode {
    return this.props.children
  }
}

if (import.meta.env.DEV) {
  __ErrorBoundary.displayName = 'ErrorBoundary'
}

const ErrorBoundary = connector(__ErrorBoundary)

if (import.meta.env.DEV) {
  ErrorBoundary.displayName = 'ErrorBoundaryWrapper'
}

export default ErrorBoundary
