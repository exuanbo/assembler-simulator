import { MiddlewareAPI, Middleware, PayloadActionCreator } from '@reduxjs/toolkit'
import type { RootState } from './store'

interface ListenerAPI extends MiddlewareAPI {
  getState: () => RootState
}

type ListenCallback<TPayload> = (payload: TPayload, api: ListenerAPI) => void | Promise<void>

type Subscription<TPayload> = Set<ListenCallback<TPayload>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriptions = Map<string, Subscription<any>>

interface ListenOptions {
  once?: boolean
}

type Unsubscribe = () => void

type ListenAction = <TPayload>(
  actionCreator: PayloadActionCreator<TPayload>,
  callback: ListenCallback<TPayload>,
  options?: ListenOptions
) => Unsubscribe

interface ActionListener extends Middleware {
  listenAction: ListenAction
}

const createActionListener = (): ActionListener => {
  const subscriptions: Subscriptions = new Map()

  // FIXME: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actionListener: ActionListener = api => next => (action: any) => {
    const result = next(action)
    subscriptions.get(action.type)?.forEach(cb => cb(action.payload, api))
    return result
  }

  actionListener.listenAction = (actionCreator, __callback, { once = false } = {}) => {
    const { type: actionType } = actionCreator
    if (!subscriptions.has(actionType)) {
      subscriptions.set(actionType, new Set())
    }
    const callbacks = subscriptions.get(actionType)!
    const callback: typeof __callback = once
      ? (payload, api) => {
          unsubscribe()
          return __callback(payload, api)
        }
      : __callback
    callbacks.add(callback)
    const unsubscribe: Unsubscribe = () => {
      if (callbacks.delete(callback) && callbacks.size === 0) {
        subscriptions.delete(actionType)
      }
    }
    return unsubscribe
  }

  return actionListener
}

export const actionListener = createActionListener()
export const { listenAction } = actionListener
