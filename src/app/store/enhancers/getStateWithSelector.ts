import type { Selector, Store } from '@reduxjs/toolkit'

import { injectStoreExtension } from './injectStoreExtension'

interface GetStateWithSelector {
  <State>(this: Store<State>): State
  <State, Selected>(this: Store<State>, selector: Selector<State, Selected>): Selected
}

export const getStateWithSelector = injectStoreExtension<{ getState: GetStateWithSelector }>(
  <State>(store: Store<State>) => {
    const getState = function <Selected>(selector?: Selector<State, Selected>) {
      const state = store.getState()
      return selector ? selector(state) : state
    }
    return { getState }
  },
)
