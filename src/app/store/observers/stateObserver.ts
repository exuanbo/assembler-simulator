import type { Middleware, Selector, StoreEnhancer } from '@reduxjs/toolkit'
import { distinctUntilChanged, map, type Observable, ReplaySubject, shareReplay } from 'rxjs'

import { injectStoreExtension } from '../enhancers/injectStoreExtension'
import { weakMemo } from './weakMemo'

type ObserveState<State> = <Result>(selector: Selector<State, Result>) => Observable<Result>

interface StateObserver<State> {
  middleware: Middleware<{}, State>
  enhancer: StoreEnhancer<{ onState: ObserveState<State> }>
}

const BUFFER_SIZE = 1 // latest state only

export const createStateObserver = <State>(): StateObserver<State> => {
  const state$ = new ReplaySubject<State>(BUFFER_SIZE)

  const distinctState$ = state$.pipe(
    distinctUntilChanged(),
    shareReplay(BUFFER_SIZE),
  )

  const middleware: Middleware<{}, State> = (api) => {
    const initialState = api.getState()
    state$.next(initialState)

    return (next) => (action) => {
      const result = next(action)
      state$.next(api.getState())
      return result
    }
  }

  const onState: ObserveState<State> = weakMemo((selector) =>
    distinctState$.pipe(
      map(selector),
      distinctUntilChanged(),
    ),
  )

  const enhancer = injectStoreExtension(() => ({ onState }))

  return { middleware, enhancer }
}
