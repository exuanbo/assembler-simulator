import { Middleware, PayloadActionCreator, getType } from '@reduxjs/toolkit'

type ListenCallback<TPayload> = (payload: TPayload) => void | Promise<void>

interface ListenOptions {
  once?: boolean
}

type Unsubscribe = () => void

type ListenAction = <TPayload>(
  actionCreator: PayloadActionCreator<TPayload>,
  callback: ListenCallback<TPayload>,
  options?: ListenOptions
) => Unsubscribe

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriptions<TPayload = any> = Map<string, Set<ListenCallback<TPayload>>>

interface ActionListener extends Middleware {
  listenAction: ListenAction
}

const createActionListener = (): ActionListener => {
  const subscriptions: Subscriptions = new Map()

  const actionListener: ActionListener = () => next => action => {
    const result = next(action)
    subscriptions.get(action.type)?.forEach(cb => cb(action.payload))
    return result
  }

  actionListener.listenAction = (actionCreator, __callback, { once = false } = {}) => {
    const actionType = getType(actionCreator)
    if (!subscriptions.has(actionType)) {
      subscriptions.set(actionType, new Set())
    }
    const callbacks = subscriptions.get(actionType)!
    const callback: typeof __callback = once
      ? payload => {
          unsubscribe()
          return __callback(payload)
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
