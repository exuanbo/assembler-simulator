import { Action, isAction, Middleware, PayloadAction, PayloadActionCreator } from '@reduxjs/toolkit'
import { filter, map, Observable, Subject } from 'rxjs'

type OnAction = <TPayload>(actionCreator: PayloadActionCreator<TPayload>) => Observable<TPayload>

interface ActionObserver {
  middleware: Middleware
  on: OnAction
}

const matchType =
  <TPayload>(actionCreator: PayloadActionCreator<TPayload>) =>
  (action: Action): action is PayloadAction<TPayload> =>
    actionCreator.match(action)

const getPayload = <TPayload>(action: PayloadAction<TPayload>): TPayload => action.payload

export const createActionObserver = (): ActionObserver => {
  const action$ = new Subject<Action>()

  const middleware: Middleware = () => (next) => (action) => {
    const result = next(action)
    if (isAction(action)) {
      action$.next(action)
    }
    return result
  }

  const on: OnAction = (actionCreator) =>
    action$.pipe(filter(matchType(actionCreator)), map(getPayload))

  return { middleware, on }
}
