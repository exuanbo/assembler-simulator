import {
  type Action,
  isAction,
  type Middleware,
  type PayloadAction,
  type PayloadActionCreator,
  type StoreEnhancer,
} from '@reduxjs/toolkit'
import { filter, map, type Observable, Subject } from 'rxjs'

import { injectStoreExtension } from '../enhancers/injectStoreExtension'
import { weakMemo } from './weakMemo'

type ObserveAction = <Payload>(actionCreator: PayloadActionCreator<Payload>) => Observable<Payload>

interface ActionObserver {
  middleware: Middleware
  enhancer: StoreEnhancer<{ onAction: ObserveAction }>
}

const matchType = <Payload>(actionCreator: PayloadActionCreator<Payload>) =>
  (action: Action): action is PayloadAction<Payload> =>
    action.type === actionCreator.type

const getPayload = <Payload>(action: PayloadAction<Payload>): Payload => action.payload

export const createActionObserver = (): ActionObserver => {
  const action$ = new Subject<Action>()

  const middleware: Middleware = () => (next) => (action) => {
    const result = next(action)
    if (isAction(action)) {
      action$.next(action)
    }
    return result
  }

  const onAction: ObserveAction = weakMemo((actionCreator) =>
    action$.pipe(filter(matchType(actionCreator)), map(getPayload)),
  )

  const enhancer = injectStoreExtension(() => ({ onAction }))

  return { middleware, enhancer }
}
