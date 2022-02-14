import type { Middleware, MiddlewareAPI } from 'redux'
import type { RootState, Dispatch } from './store'

interface WatchAPI<TSelected> extends MiddlewareAPI<Dispatch, RootState> {
  getPrevSelected: () => TSelected
}

type WatchCallback<TSelected> = (
  selectedState: TSelected,
  api: WatchAPI<TSelected>
) => void | Promise<void>

type Unsubscribe = () => void

type Watch = <TSelected>(
  selector: (state: RootState) => TSelected,
  callback: WatchCallback<TSelected>
) => Unsubscribe

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriptions<TSelected = any> = Map<
  (state: RootState) => TSelected,
  {
    prevSelected: TSelected
    callbacks: Set<WatchCallback<TSelected>>
  }
>

const nil = Symbol('nil')

interface Watcher extends Middleware {
  watch: Watch
}

export const createWatcher = (): Watcher => {
  const subscriptions: Subscriptions = new Map()

  const watcher: Watcher = api => next => action => {
    const startState = api.getState()
    const result = next(action)
    const state = api.getState()
    subscriptions.forEach((subscription, selector) => {
      if (subscription.prevSelected === nil) {
        subscription.prevSelected = selector(startState)
      }
      const { prevSelected, callbacks } = subscription
      const selectedState = selector(state)
      if (selectedState !== prevSelected) {
        callbacks.forEach(cb =>
          cb(selectedState, {
            ...api,
            getPrevSelected: () => prevSelected
          })
        )
        subscription.prevSelected = selectedState
      }
    })
    return result
  }

  watcher.watch = (selector, callback) => {
    if (!subscriptions.has(selector)) {
      subscriptions.set(selector, {
        prevSelected: nil,
        callbacks: new Set()
      })
    }
    const { callbacks } = subscriptions.get(selector)!
    callbacks.add(callback)
    return () => {
      if (callbacks.delete(callback) && callbacks.size === 0) {
        subscriptions.delete(selector)
      }
    }
  }

  return watcher
}
