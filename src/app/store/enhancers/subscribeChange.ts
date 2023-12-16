import type { Store } from '@reduxjs/toolkit'

import { injectStoreExtension } from './injectStoreExtension'

type SubscribeChange = Store['subscribe']

export const subscribeChange = injectStoreExtension<{ subscribeChange: SubscribeChange }>(
  <State>(store: Store<State>) => {
    let stateSnapshot: State | null = null

    const dispatch: typeof store.dispatch = (action) => {
      try {
        stateSnapshot = store.getState()
        return store.dispatch(action)
      } finally {
        stateSnapshot = null
      }
    }

    const subscribeChange: SubscribeChange = (listener) =>
      store.subscribe(() => {
        const state = store.getState()
        if (state !== stateSnapshot) {
          listener()
        }
      })

    return { dispatch, subscribeChange }
  },
)
