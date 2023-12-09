import type { Store, StoreEnhancer } from '@reduxjs/toolkit'

type SubscribeChange = Store['subscribe']

export const subscribeChange: StoreEnhancer<{ subscribeChange: SubscribeChange }> =
  (createStore) =>
  (...args) => {
    const store = createStore(...args)

    let stateSnapshot: ReturnType<typeof store.getState> | null = null

    const dispatch: typeof store.dispatch = (action) => {
      try {
        stateSnapshot = store.getState()
        return store.dispatch(action)
      } finally {
        stateSnapshot = null
      }
    }

    const subscribeChange: typeof store.subscribe = (listener) =>
      store.subscribe(() => {
        const state = store.getState()
        if (state !== stateSnapshot) {
          listener()
        }
      })

    return {
      ...store,
      dispatch,
      subscribeChange,
    }
  }
