import type { Selector, Store } from '@reduxjs/toolkit'

import { injectStoreExtension } from './injectStoreExtension'

interface GetStateWithSelector<State> {
  (): State
  <Selected>(selector: Selector<State, Selected>): Selected
}

export const createSelectorEnhancer = <State>() =>
  injectStoreExtension<{ getState: GetStateWithSelector<State> }>((store: Store<State>) => {
    const getState = <Selected>(selector?: Selector<State, Selected>) => {
      const state = store.getState()
      return selector ? selector(state) : state
    }
    return { getState }
  })
