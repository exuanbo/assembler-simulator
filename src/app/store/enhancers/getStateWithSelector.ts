import type { Selector, StoreEnhancer } from '@reduxjs/toolkit'

type GetStateWithSelector<State> = <Selected>(selector: Selector<State, Selected>) => Selected

export const createSelectorEnhancer =
  <State>(): StoreEnhancer<{ getState: GetStateWithSelector<State> }> =>
  (createStore) =>
  (...args) => {
    const store = createStore(...args)

    const getState = <Selected>(selector?: Selector<unknown, Selected>) => {
      const state = store.getState()
      return selector ? selector(state) : state
    }

    return {
      ...store,
      getState,
    }
  }
