import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit'
import type { RootState } from './store'

interface WatcherAPI extends MiddlewareAPI {
  getState: () => RootState
}

type WatchCallback<TSelected> = (selectedState: TSelected, api: WatcherAPI) => void | Promise<void>

type Unsubscribe = () => void

type Watch = <TSelected>(
  selector: (state: RootState) => TSelected,
  callback: WatchCallback<TSelected>
) => Unsubscribe

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriptions<TSelected = any> = Map<
  (state: RootState) => TSelected,
  Set<WatchCallback<TSelected>>
>

interface Watcher extends Middleware {
  watch: Watch
}

const createWatcher = (): Watcher => {
  const subscriptions: Subscriptions = new Map()

  const watcher: Watcher = api => next => action => {
    const startState = api.getState()
    const result = next(action)
    const state = api.getState()
    subscriptions.forEach((callbacks, selector) => {
      const startSelected = selector(startState)
      const selectedState = selector(state)
      if (selectedState !== startSelected) {
        callbacks.forEach(cb => cb(selectedState, api))
      }
    })
    return result
  }

  watcher.watch = (selector, callback) => {
    if (!subscriptions.has(selector)) {
      subscriptions.set(selector, new Set())
    }
    const callbacks = subscriptions.get(selector)!
    callbacks.add(callback)
    return () => {
      if (callbacks.delete(callback) && callbacks.size === 0) {
        subscriptions.delete(selector)
      }
    }
  }

  return watcher
}

export const watcher = createWatcher()
export const { watch } = watcher
