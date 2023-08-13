import { useDebugValue } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'
import { RootStateSelector, store } from './store'

type EqualityFn<T> = (a: T, b: T) => boolean

const refEquality: EqualityFn<unknown> = (a, b) => a === b

export const useSelector = <TSelected>(
  selector: RootStateSelector<TSelected>,
  equalityFn: EqualityFn<TSelected> = refEquality
): TSelected => {
  const selectedState = useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    null,
    selector,
    equalityFn
  )
  useDebugValue(selectedState)
  return selectedState
}
