import type { RootState, Store } from './store'

type WatchCallback<S> = (selectedState: S, getState: () => RootState) => void

type Unsubscribe = () => void

type Watch = <S>(selector: (state: RootState) => S, callback: WatchCallback<S>) => Unsubscribe

type Subscriptions<S> = Map<
  (state: RootState) => S,
  {
    prev: S
    callbacks: Set<WatchCallback<S>>
  }
>

export const createWatch = (store: Store): Watch => {
  const { getState, subscribe } = store

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptions: Subscriptions<any> = new Map()

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
    const callbacks = subscriptions.get(selector)!.callbacks
    callbacks.add(callback)
    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        subscriptions.delete(selector)
      }
    }
  }
}
