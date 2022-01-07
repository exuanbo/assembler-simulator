import type { RootState, Store } from './store'

type WatchCallback<TSelected> = (selectedState: TSelected, getState: () => RootState) => void

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

export const createWatch = (store: Store): Watch => {
  const { getState, subscribe } = store

  const subscriptions: Subscriptions = new Map()

  subscribe(() => {
    const state = getState()
    subscriptions.forEach((subscription, selector) => {
      const { prev, callbacks } = subscription
      const selectedState = selector(state)
      if (selectedState !== prev) {
        callbacks.forEach(cb => {
          cb(selectedState, getState)
        })
        subscription.prev = selectedState
      }
    })
  })

  return (selector, callback) => {
    if (!subscriptions.has(selector)) {
      subscriptions.set(selector, {
        prev: selector(getState()),
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
}
