import type { Store } from '@reduxjs/toolkit'

import { invariant } from '@/common/utils'

import { injectStoreExtension } from './injectStoreExtension'

type SubscribeChange = Store['subscribe']

export const subscribeChange = injectStoreExtension<{ subscribeChange: SubscribeChange }>(
  <State>(store: Store<State>) => {
    const NIL = Symbol('NIL')
    let stateSnapshot: State | typeof NIL = NIL

    const dispatch: typeof store.dispatch = (action) => {
      invariant(stateSnapshot === NIL)
      try {
        stateSnapshot = store.getState()
        return store.dispatch(action)
      } finally {
        stateSnapshot = NIL
      }
    }

    const subscribeChange: SubscribeChange = (listener) =>
      store.subscribe(() => {
        invariant(stateSnapshot !== NIL)
        const state = store.getState()
        if (state !== stateSnapshot) {
          listener()
        }
      })

    return { dispatch, subscribeChange }
  },
)
