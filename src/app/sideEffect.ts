import type { PayloadAction } from '@reduxjs/toolkit'
import type { Middleware } from 'redux'

type SideEffectCallback<A extends PayloadAction = PayloadAction> = (
  action: A
) => void | Promise<void>

const subscriptions = new Map<string, Set<SideEffectCallback>>()

type Unsubscribe = () => void

export const subscribe = <C extends SideEffectCallback>(actionType: string, cb: C): Unsubscribe => {
  if (!subscriptions.has(actionType)) {
    subscriptions.set(actionType, new Set())
  }
  const callbacks = subscriptions.get(actionType)!
  callbacks.add(cb)
  return () => {
    callbacks.delete(cb)
  }
}

const sideEffect: Middleware = _ => next => action => {
  const result = next(action)
  subscriptions.get(action.type)?.forEach(cb => cb(action))
  return result
}

export default sideEffect
