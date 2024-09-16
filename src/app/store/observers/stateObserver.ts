import type { Middleware, Selector, StoreEnhancer } from '@reduxjs/toolkit'
import { BehaviorSubject, distinctUntilChanged, map, type Observable } from 'rxjs'

import { invariant } from '@/common/utils'

import { injectStoreExtension } from '../enhancers/injectStoreExtension'
import { weakMemo } from './weakMemo'

type ObserveState<State> = <Result>(selector: Selector<State, Result>) => Observable<Result>

interface StateObserver<State> {
  middleware: Middleware<{}, State>
  enhancer: StoreEnhancer<{ onState: ObserveState<State> }>
}

export const createStateObserver = <State>(): StateObserver<State> => {
  const NIL = Symbol('NIL')
  const state$ = new BehaviorSubject<State | typeof NIL>(NIL)

  const distinctState$ = state$.pipe(
    map((state) => (invariant(state !== NIL), state)),
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

  const onState: ObserveState<State> = weakMemo((selector) =>
    distinctState$.pipe(map(selector), distinctUntilChanged()),
  )

  const enhancer = injectStoreExtension(() => ({ onState }))

  return { middleware, enhancer }
}
