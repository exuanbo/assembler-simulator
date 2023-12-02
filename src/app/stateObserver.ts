import type { Middleware } from '@reduxjs/toolkit'
import { distinctUntilChanged, identity, map, Observable, ReplaySubject, skip } from 'rxjs'

import type { StateSelector } from './selector'
import type { RootState } from './store'

interface OnStateOptions {
  initial?: boolean
}

type OnState = <TSelected>(
  selector: StateSelector<TSelected>,
  options?: OnStateOptions,
) => Observable<TSelected>

interface StateObserver {
  middleware: Middleware
  on: OnState
}

export const createStateObserver = (): StateObserver => {
  const state$ = new ReplaySubject<RootState>(1)
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

  const on: OnState = (selector, { initial = false } = {}) =>
    distinctState$.pipe(map(selector), distinctUntilChanged(), initial ? identity : skip(1))

  return { middleware, on }
}
