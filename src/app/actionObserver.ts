import { Middleware, PayloadActionCreator, Action, isAction } from '@reduxjs/toolkit'
import { Observable, Subject, filter, map } from 'rxjs'

interface ActionObserver {
  middleware: Middleware
  onAction: <TPayload>(actionCreator: PayloadActionCreator<TPayload>) => Observable<TPayload>
}

export const createActionObserver = (): ActionObserver => {
  const action$ = new Subject<Action>()

  const middleware: Middleware = () => next => action => {
    const result = next(action)
    if (isAction(action)) {
      action$.next(action)
    }
    return result
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onAction = (actionCreator: PayloadActionCreator<any>): Observable<any> =>
    action$.pipe(
      filter(actionCreator.match),
      map(action => action.payload)
    )

  return { middleware, onAction }
}
