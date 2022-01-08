import type { Middleware } from 'redux'
import type { RootState, Dispatch } from './store'

interface WatchAPI {
  getPrevState: () => RootState
  dispatch: Dispatch
}

type WatchCallback<TSelected> = (selectedState: TSelected, api: WatchAPI) => void

type Unsubscribe = () => void

type Watch = <TSelected>(
  selector: (state: RootState) => TSelected,
  callback: WatchCallback<TSelected>
) => Unsubscribe

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriptions<TSelected = any> = Map<
  (state: RootState) => TSelected,
  {
    prev: TSelected
    callbacks: Set<WatchCallback<TSelected>>
  }
>

const uninitialized = Symbol('uninitialized')

interface Watcher {
  middleware: Middleware
  watch: Watch
}

export const createWatcher = (): Watcher => {
  const subscriptions: Subscriptions = new Map()

  const middleware: Middleware = api => next => action => {
    const startState = api.getState()
    const result = next(action)
    const state = api.getState()
    subscriptions.forEach((subscription, selector) => {
      if (subscription.prev === uninitialized) {
        subscription.prev = selector(startState)
      }
      const { prev, callbacks } = subscription
      const selectedState = selector(state)
      if (selectedState !== prev) {
        callbacks.forEach(cb => {
          cb(selectedState, {
            getPrevState: () => prev,
            dispatch: api.dispatch
          })
        })
        subscription.prev = selectedState
      }
    })
    return result
  }

  const watch: Watch = (selector, callback) => {
    if (!subscriptions.has(selector)) {
      subscriptions.set(selector, {
        prev: uninitialized,
        callbacks: new Set()
      })
    }
    const { callbacks } = subscriptions.get(selector)!
    callbacks.add(callback)
    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        subscriptions.delete(selector)
      }
    }
  }

  return { middleware, watch }
}
