import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit'
import type { RootState } from './store'

type Selector<TSelected> = (state: RootState) => TSelected

interface WatcherAPI extends MiddlewareAPI {
  getState: () => RootState
}

type WatchCallback<TSelected> = (selectedState: TSelected, api: WatcherAPI) => void | Promise<void>

interface Subscription<TSelected> {
  prevSelected: TSelected
  callbacks: Set<WatchCallback<TSelected>>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriptions<TSelected = any> = Map<Selector<TSelected>, Subscription<TSelected>>

type Unsubscribe = () => void

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
        if (subscription.prevSelected === nil) {
          subscription.prevSelected = selector(startState)
        }
      })
      hasUninitializedSubscription = false
    }
    stackCount += 1
    const result = next(action)
    if (stackCount === 1) {
      const state = api.getState()
      subscriptions.forEach((subscription, selector) => {
        const { prevSelected, callbacks } = subscription
        const selectedState = selector(state)
        if (selectedState !== prevSelected) {
          callbacks.forEach(cb => cb(selectedState, api))
          subscription.prevSelected = selectedState
        }
      })
    }
    stackCount -= 1
    return result
  }

  watcher.watch = (selector, callback) => {
    if (!subscriptions.has(selector)) {
      subscriptions.set(selector, {
        prevSelected: nil,
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
