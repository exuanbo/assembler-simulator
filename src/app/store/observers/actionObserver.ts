import {
  type Action,
  isAction,
  type Middleware,
  type PayloadAction,
  type PayloadActionCreator,
  type StoreEnhancer,
} from '@reduxjs/toolkit'
import { filter, map, type Observable, Subject } from 'rxjs'

import { injectExtension } from '../enhancers/injectExtension'
import { createWeakCache } from './weakCache'

type OnAction = <TPayload>(actionCreator: PayloadActionCreator<TPayload>) => Observable<TPayload>

interface ActionObserver {
  middleware: Middleware
  enhancer: StoreEnhancer<{ onAction: OnAction }>
}

const matchType =
  <TPayload>(actionCreator: PayloadActionCreator<TPayload>) =>
  (action: Action): action is PayloadAction<TPayload> =>
    action.type === actionCreator.type

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
  const getOrCache = createWeakCache<PayloadActionCreator<any>>()

  const onAction: OnAction = (actionCreator) =>
    getOrCache(actionCreator, () => action$.pipe(filter(matchType(actionCreator)), map(getPayload)))

  return {
    middleware,
    enhancer: injectExtension({ onAction }),
  }
}