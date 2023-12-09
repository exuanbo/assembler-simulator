import type { Middleware, Selector, StoreEnhancer } from '@reduxjs/toolkit'
import { distinctUntilChanged, map, type Observable, ReplaySubject } from 'rxjs'

import { injectExtension } from '../enhancers/injectExtension'
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
    let dispatchDepth = 0

    return (next) => (action) => {
      try {
        dispatchDepth += 1
        const result = next(action)
        if (dispatchDepth === 1) {
          state$.next(api.getState())
        }
        return result
      } finally {
        dispatchDepth -= 1
      }
    }
  }

  const getOrCache = createWeakCache<Selector<TState, unknown>>()

  const onState: OnState<TState> = (selector) =>
    getOrCache(selector, () => distinctState$.pipe(map(selector), distinctUntilChanged()))

  return {
    middleware,
    enhancer: injectExtension({ onState }),
  }
}
