import type { Selector, Store } from '@reduxjs/toolkit'

import { injectStoreExtension } from './injectStoreExtension'

interface GetStateWithSelector {
  <State>(this: Store<State>): State
  <State, Result>(this: Store<State>, selector: Selector<State, Result>): Result
}

export const getStateWithSelector = injectStoreExtension<{ getState: GetStateWithSelector }>(
  <State>(store: Store<State>) => {
    const getState = function <Result>(selector?: Selector<State, Result>) {
      const state = store.getState()
      return selector ? selector(state) : state
    }
    return { getState }
  },
)
