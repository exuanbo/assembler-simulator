import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit'
import type { RootState } from './store'

type Selector<TSelected> = (state: RootState) => TSelected

interface WatcherAPI extends MiddlewareAPI {
  getState: () => RootState
}

type WatchCallback<TSelected> = (selectedState: TSelected, api: WatcherAPI) => void | Promise<void>

interface Subscription<TSelected> {
  selectedState: TSelected
  callbacks: Set<WatchCallback<TSelected>>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriptions<TSelected = any> = Map<Selector<TSelected>, Subscription<TSelected>>

export type Unsubscribe = () => void

type Watch = <TSelected>(
  selector: Selector<TSelected>,
  callback: WatchCallback<TSelected>
) => Unsubscribe

interface Watcher extends Middleware {
  watch: Watch
}

const nil = Symbol('nil')

const createWatcher = (): Watcher => {
  const subscriptions: Subscriptions = new Map()
  let hasUninitializedSubscription = false
  let stackCount = 0

  const watcher: Watcher = api => next => action => {
    if (hasUninitializedSubscription) {
      const startState = api.getState()
      subscriptions.forEach((subscription, selector) => {
        if (subscription.selectedState === nil) {
          subscription.selectedState = selector(startState)
        }
      })
      hasUninitializedSubscription = false
    }
    stackCount += 1
    const result = next(action)
    stackCount -= 1
    if (stackCount === 0) {
      const state = api.getState()
      subscriptions.forEach((subscription, selector) => {
        const currentSelectedState = selector(state)
        if (currentSelectedState !== subscription.selectedState) {
          subscription.callbacks.forEach(cb => cb(currentSelectedState, api))
          subscription.selectedState = currentSelectedState
        }
      })
    }
    return result
  }

  watcher.watch = (selector, callback) => {
    if (!subscriptions.has(selector)) {
      subscriptions.set(selector, {
        selectedState: nil,
        callbacks: new Set()
      })
      hasUninitializedSubscription = true
    }
    const { callbacks } = subscriptions.get(selector)!
    callbacks.add(callback)
    const unsubscribe: Unsubscribe = () => {
      if (callbacks.delete(callback) && callbacks.size === 0) {
        subscriptions.delete(selector)
      }
    }
    return unsubscribe
  }

  return watcher
}

export const watcher = createWatcher()
export const { watch } = watcher
