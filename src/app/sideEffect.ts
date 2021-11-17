import { PayloadActionCreator, getType } from '@reduxjs/toolkit'
import type { Middleware } from 'redux'

type SideEffectCallback<P> = (payload: P) => void | Promise<void>

const subscriptions = new Map<string, Set<SideEffectCallback<any>>>() // eslint-disable-line

type Unsubscribe = () => void

export const subscribe = <P>(
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

const sideEffect: Middleware = () => next => action => {
  const result = next(action)
  subscriptions.get(action.type)?.forEach(cb => cb(action.payload))
  return result
}

export default sideEffect
