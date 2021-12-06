import { PayloadActionCreator, getType } from '@reduxjs/toolkit'
import type { Middleware, MiddlewareAPI } from 'redux'
import type { RootState, Dispatch } from './store'

type SideEffectCallback<P> = (
  payload: P,
  api: MiddlewareAPI<Dispatch, RootState>
) => void | Promise<void>

const subscriptions = new Map<string, Set<SideEffectCallback<any>>>() // eslint-disable-line

type Unsubscribe = () => void

export const subscribeAction = <P>(
  actionCreator: PayloadActionCreator<P>,
  callback: SideEffectCallback<P>
): Unsubscribe => {
  const actionType = getType(actionCreator)
  if (!subscriptions.has(actionType)) {
    subscriptions.set(actionType, new Set())
  }
  const callbacks = subscriptions.get(actionType)!
  callbacks.add(callback)
  return () => {
    callbacks.delete(callback)
  }
}

const sideEffect: Middleware = api => next => action => {
  const result = next(action)
  subscriptions.get(action.type)?.forEach(cb => cb(action.payload, api))
  return result
}

export default sideEffect
