import { Middleware, PayloadActionCreator, Action, PayloadAction, isAction } from '@reduxjs/toolkit'
import { Observable, Subject, filter, map } from 'rxjs'

type OnAction = <TPayload>(actionCreator: PayloadActionCreator<TPayload>) => Observable<TPayload>

interface ActionObserver {
  middleware: Middleware
  on: OnAction
}

const matchType =
  <TPayload>(actionCreator: PayloadActionCreator<TPayload>) =>
  (action: Action): action is PayloadAction<TPayload> =>
    actionCreator.match(action)

export const createActionObserver = (): ActionObserver => {
  const action$ = new Subject<Action>()

  const middleware: Middleware = () => next => action => {
    const result = next(action)
    if (isAction(action)) {
      action$.next(action)
    }
    return result
  }

  const on: OnAction = actionCreator =>
    action$.pipe(
      filter(matchType(actionCreator)),
      map(action => action.payload)
    )

  return { middleware, on }
}
