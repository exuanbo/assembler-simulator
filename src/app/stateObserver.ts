import type { Middleware } from '@reduxjs/toolkit'
import { Observable, ReplaySubject, map, distinctUntilChanged, skip } from 'rxjs'
import type { RootState, RootStateSelector } from './store'

interface StateObserver {
  middleware: Middleware
  onState: <TSelected>(selector: RootStateSelector<TSelected>) => Observable<TSelected>
}

export const createStateObserver = (): StateObserver => {
  const state$ = new ReplaySubject<RootState>(1)
  const distinctState$ = state$.pipe(distinctUntilChanged())

  const middleware: Middleware = api => {
    state$.next(api.getState())
    let nestedDepth = 0

    return next => action => {
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

  const onState = <TSelected>(selector: RootStateSelector<TSelected>): Observable<TSelected> =>
    distinctState$.pipe(map(selector), distinctUntilChanged(), skip(1))

  return { middleware, onState }
}
