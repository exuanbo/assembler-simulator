import type { Middleware, Selector, StoreEnhancer } from '@reduxjs/toolkit'
import { distinctUntilChanged, map, type Observable, ReplaySubject } from 'rxjs'

import { injectExtension } from '../enhancers/injectExtension'
import { createWeakCache } from './weakCache'

type ObserveState<State> = <Selected>(selector: Selector<State, Selected>) => Observable<Selected>

interface StateObserver<State> {
  middleware: Middleware<{}, State>
  enhancer: StoreEnhancer<{ onState: ObserveState<State> }>
}

export const createStateObserver = <State>(): StateObserver<State> => {
  const state$ = new ReplaySubject<State>(1)
  const distinctState$ = state$.pipe(distinctUntilChanged())

  const middleware: Middleware<{}, State> = (api) => {
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

  const getOrCache = createWeakCache<Selector<State, unknown>>()

  const onState: ObserveState<State> = (selector) =>
    getOrCache(selector, () => distinctState$.pipe(map(selector), distinctUntilChanged()))

  return {
    middleware,
    enhancer: injectExtension({ onState }),
  }
}
