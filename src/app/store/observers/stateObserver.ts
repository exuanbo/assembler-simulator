import type { Middleware, Selector, StoreEnhancer } from '@reduxjs/toolkit'
import { BehaviorSubject, distinctUntilChanged, map, type Observable } from 'rxjs'

import { invariant } from '@/common/utils'

import { injectExtension } from '../enhancers/injectExtension'
import { createWeakCache } from './weakCache'

type ObserveState<State> = <Selected>(selector: Selector<State, Selected>) => Observable<Selected>

interface GetSelectedState<State> {
  (): State
  <Selected>(selector: Selector<State, Selected>): Selected
}

interface StateObserver<State> {
  middleware: Middleware<{}, State>
  enhancer: StoreEnhancer<{
    onState: ObserveState<State>
    getState: GetSelectedState<State>
  }>
}

export const createStateObserver = <State extends {}>(): StateObserver<State> => {
  const state$ = new BehaviorSubject<State | null>(null)

  const distinctState$ = state$.pipe(
    map((state) => (invariant(state != null), state)),
    distinctUntilChanged(),
  )

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

  const getState: GetSelectedState<State> = <Selected>(selector?: Selector<State, Selected>) => {
    const state = state$.getValue()
    invariant(state != null)
    return selector ? selector(state) : state
  }

  return {
    middleware,
    enhancer: injectExtension({ onState, getState }),
  }
}
