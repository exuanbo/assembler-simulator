import type { Middleware, Selector, StoreEnhancer } from '@reduxjs/toolkit'
import { BehaviorSubject, distinctUntilChanged, map, type Observable } from 'rxjs'

import { invariant } from '@/common/utils'

import { injectStoreExtension } from '../enhancers/injectStoreExtension'
import { createWeakCache } from './weakCache'

type ObserveState<State> = <Selected>(selector: Selector<State, Selected>) => Observable<Selected>

interface StateObserver<State> {
  middleware: Middleware<{}, State>
  enhancer: StoreEnhancer<{ onState: ObserveState<State> }>
}

export const createStateObserver = <State extends {}>(): StateObserver<State> => {
  const state$ = new BehaviorSubject<State | null>(null)

  const distinctState$ = state$.pipe(
    map((state) => (invariant(state != null), state)),
    distinctUntilChanged(),
  )

  const middleware: Middleware<{}, State> = (api) => {
    state$.next(api.getState())

    return (next) => (action) => {
      const result = next(action)
      state$.next(api.getState())
      return result
    }
  }

  const cache = createWeakCache<Selector<State, unknown>>()

  const onState: ObserveState<State> = (selector) =>
    cache(selector, () => distinctState$.pipe(map(selector), distinctUntilChanged()))

  const enhancer = injectStoreExtension(() => ({ onState }))

  return { middleware, enhancer }
}
