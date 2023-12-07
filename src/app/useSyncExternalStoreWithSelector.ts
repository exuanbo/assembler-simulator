// Simplified fork of the useSyncExternalStore hook from the official package,
// with `getServerSnapshot` parameter removed and `instRef` simplified using a symbol.
// https://github.com/facebook/react/blob/be8aa76873e231555676483a36534bb48ad1b1a3/packages/use-sync-external-store/src/useSyncExternalStoreWithSelector.js
// MIT Licensed https://github.com/facebook/react/blob/be8aa76873e231555676483a36534bb48ad1b1a3/LICENSE

import { useDebugValue, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

const NIL = Symbol('NIL')

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  selector: (snapshot: Snapshot) => Selection,
  isEqual: (a: Selection, b: Selection) => boolean,
): Selection {
  // Use this to track the rendered snapshot.
  const selectionRef = useRef<Selection | typeof NIL>(NIL)

  const getSelection = useMemo(() => {
    // Track the memoized state using closure variables that are local to this
    // memoized instance of a getSnapshot function. Intentionally not using a
    // useRef hook, because that state would be shared across all concurrent
    // copies of the hook/component.
    let hasMemo = false
    let memoizedSnapshot: Snapshot
    let memoizedSelection: Selection
    const memoizedSelector = (nextSnapshot: Snapshot) => {
      if (!hasMemo) {
        // The first time the hook is called, there is no memoized result.
        hasMemo = true
        memoizedSnapshot = nextSnapshot
        const nextSelection = selector(nextSnapshot)
        // Even if the selector has changed, the currently rendered selection
        // may be equal to the new selection. We should attempt to reuse the
        // current value if possible, to preserve downstream memoizations.
        const currentSelection = selectionRef.current
        if (currentSelection !== NIL && isEqual(currentSelection, nextSelection)) {
          memoizedSelection = currentSelection
          return currentSelection
        }
        memoizedSelection = nextSelection
        return nextSelection
      }

      // We may be able to reuse the previous invocation's result.
      const prevSnapshot = memoizedSnapshot
      const prevSelection = memoizedSelection

      if (Object.is(prevSnapshot, nextSnapshot)) {
        // The snapshot is the same as last time. Reuse the previous selection.
        return prevSelection
      }

      // The snapshot has changed, so we need to compute a new selection.
      const nextSelection = selector(nextSnapshot)

      // Use the provided isEqual function to check if the data has changed. If
      // it hasn't, return the previous selection. That signals to React that
      // the selections are conceptually equal, and we can bail out of rendering.
      if (isEqual(prevSelection, nextSelection)) {
        memoizedSnapshot = nextSnapshot
        return prevSelection
      }

      memoizedSnapshot = nextSnapshot
      memoizedSelection = nextSelection
      return nextSelection
    }

    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot())
    return getSnapshotWithSelector
  }, [getSnapshot, selector, isEqual])

  const selection = useSyncExternalStore(subscribe, getSelection)

  useEffect(() => {
    selectionRef.current = selection
  }, [selection])

  useDebugValue(selection)
  return selection
}
