import type { Store } from '@reduxjs/toolkit'

import { invariant } from '@/common/utils'

import { injectStoreExtension } from './injectStoreExtension'

type SubscribeChange = Store['subscribe']

export const subscribeChange = injectStoreExtension<{ subscribeChange: SubscribeChange }>(
  <State>(store: Store<State>) => {
    const NIL = Symbol('NIL')
    let snapshot: State | typeof NIL = NIL

    const dispatch: typeof store.dispatch = (action) => {
      invariant(snapshot === NIL)
      snapshot = store.getState()
      try {
        return store.dispatch(action)
      }
      finally {
        snapshot = NIL
      }
    }

    const subscribeChange: SubscribeChange = (listener) =>
      store.subscribe(() => {
        invariant(snapshot !== NIL)
        if (snapshot !== store.getState()) {
          listener()
        }
      })

    return { dispatch, subscribeChange }
  },
)
