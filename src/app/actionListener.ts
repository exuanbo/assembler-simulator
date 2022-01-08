import { PayloadActionCreator, getType } from '@reduxjs/toolkit'
import type { Middleware, MiddlewareAPI } from 'redux'
import type { RootState, Dispatch } from './store'

type ListenAPI = MiddlewareAPI<Dispatch, RootState>

type ListenCallback<P> = (payload: P, api: ListenAPI) => void | Promise<void>

type Unsubscribe = () => void

type ListenAction = <P>(
  actionCreator: PayloadActionCreator<P>,
  callback: ListenCallback<P>
) => Unsubscribe

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriptions<P = any> = Map<string, Set<ListenCallback<P>>>

interface ActionListener {
  middleware: Middleware
  listenAction: ListenAction
}

export const createActionListener = (): ActionListener => {
  const subscriptions: Subscriptions = new Map()

  const middleware: Middleware = api => next => action => {
    const result = next(action)
    subscriptions.get(action.type)?.forEach(cb => cb(action.payload, api))
    return result
  }

  const listenAction: ListenAction = (actionCreator, callback) => {
    const actionType = getType(actionCreator)
    if (!subscriptions.has(actionType)) {
      subscriptions.set(actionType, new Set())
    }
    const callbacks = subscriptions.get(actionType)!
    callbacks.add(callback)
    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        subscriptions.delete(actionType)
      }
    }
  }

  return { middleware, listenAction }
}
