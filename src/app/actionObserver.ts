import {
  type Action,
  isAction,
  type Middleware,
  type PayloadAction,
  type PayloadActionCreator,
  type StoreEnhancer,
} from '@reduxjs/toolkit'
import { filter, map, type Observable, Subject } from 'rxjs'

import { extendStore } from './storeEnhancer'

type OnAction = <TPayload>(actionCreator: PayloadActionCreator<TPayload>) => Observable<TPayload>

interface ActionObserver {
  middleware: Middleware
  enhancer: StoreEnhancer<{ onAction: OnAction }>
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload$Map = new WeakMap<PayloadActionCreator<any>, Observable<any>>()

  const onAction: OnAction = (actionCreator) => {
    let payload$ = payload$Map.get(actionCreator)
    if (!payload$) {
      payload$ = action$.pipe(filter(matchType(actionCreator)), map(getPayload))
      payload$Map.set(actionCreator, payload$)
    }
    return payload$
  }

  return {
    middleware,
    enhancer: extendStore({ onAction }),
  }
}
