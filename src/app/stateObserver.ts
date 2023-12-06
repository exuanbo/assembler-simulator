import type { Middleware, Selector, StoreEnhancer } from '@reduxjs/toolkit'
import { distinctUntilChanged, map, type Observable, ReplaySubject } from 'rxjs'

import { extendStore } from './storeEnhancer'
import { createWeakCache } from './weakCache'

type OnState<TState> = <TSelected>(selector: Selector<TState, TSelected>) => Observable<TSelected>

interface StateObserver<TState> {
  middleware: Middleware
  enhancer: StoreEnhancer<{ onState: OnState<TState> }>
}

export const createStateObserver = <TState>(): StateObserver<TState> => {
  const state$ = new ReplaySubject<TState>(1)
  const distinctState$ = state$.pipe(distinctUntilChanged())

  const middleware: Middleware = (api) => {
    state$.next(api.getState())
    let nestedDepth = 0

    return (next) => (action) => {
      try {
        nestedDepth += 1
        const result = next(action)
        if (nestedDepth === 1) {
          state$.next(api.getState())
        }
        return result
      } finally {
        nestedDepth -= 1
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOrCache = createWeakCache<Selector<TState, unknown>, Observable<any>>()

  const onState: OnState<TState> = (selector) =>
    getOrCache(selector, () => distinctState$.pipe(map(selector), distinctUntilChanged()))

  return {
    middleware,
    enhancer: extendStore({ onState }),
  }
}
