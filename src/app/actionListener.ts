import { PayloadActionCreator, getType } from '@reduxjs/toolkit'
import type { Middleware, MiddlewareAPI } from 'redux'
import type { RootState, Dispatch } from './store'

type Listener<P> = (payload: P, api: MiddlewareAPI<Dispatch, RootState>) => void | Promise<void>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subscriptions = new Map<string, Set<Listener<any>>>()

export type RemoveActionListener = () => void

export const addActionListener = <P>(
  actionCreator: PayloadActionCreator<P>,
  listener: Listener<P>
): RemoveActionListener => {
  const actionType = getType(actionCreator)
  if (!subscriptions.has(actionType)) {
    subscriptions.set(actionType, new Set())
  }
  const listeners = subscriptions.get(actionType)!
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const actionListenerMiddleware: Middleware = api => next => action => {
  const result = next(action)
  subscriptions.get(action.type)?.forEach(listener => listener(action.payload, api))
  return result
}

export default actionListenerMiddleware
