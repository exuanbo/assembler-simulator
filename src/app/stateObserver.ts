import type { Middleware, Selector, StoreEnhancer } from '@reduxjs/toolkit'
import { distinctUntilChanged, identity, map, type Observable, ReplaySubject, skip } from 'rxjs'

import { extendStore } from './storeEnhancer'

interface OnStateOptions {
  initial?: boolean
}

type OnState<TState> = <TSelected>(
  selector: Selector<TState, TSelected>,
  options?: OnStateOptions,
) => Observable<TSelected>

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
  const selected$Map = new WeakMap<Selector<TState, unknown>, Observable<any>>()

  const onState: OnState<TState> = (selector, { initial = false } = {}) => {
    let selected$ = selected$Map.get(selector)
    if (!selected$) {
      selected$ = distinctState$.pipe(map(selector), distinctUntilChanged())
      selected$Map.set(selector, selected$)
    }
    return selected$.pipe(initial ? identity : skip(1))
  }

  return {
    middleware,
    enhancer: extendStore({ onState }),
  }
}
