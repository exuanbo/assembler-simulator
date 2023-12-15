import { useEffect } from 'react'
import { debounceTime, delayWhen, filter, merge, of, tap, timer } from 'rxjs'

import { store } from '@/app/store'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'
import { useSingleton } from '@/common/hooks'
import { observe } from '@/common/observe'
import { setAssemblerError, setAssemblerState } from '@/features/assembler/assemblerSlice'
import { setEditorInput } from '@/features/editor/editorSlice'

import {
  selectAutoAssemble,
  selectIsRunning,
  selectIsSuspended,
  selectRuntimeConfiguration,
} from './controllerSlice'
import { Controller } from './core'

export const useController = (): Controller => {
  const controller = useSingleton(() => new Controller())

  useEffect(() => {
    const autoAssemble$ = store.onState(selectAutoAssemble)
    return observe(
      autoAssemble$.pipe(debounceTime(UPDATE_TIMEOUT_MS), filter(Boolean)),
      controller.assemble,
    )
  }, [controller])

  useEffect(() => {
    const setEditorInput$ = store.onAction(setEditorInput)
    return observe(
      setEditorInput$.pipe(
        tap(controller.resetSelf),
        filter(() => store.getState(selectAutoAssemble)),
        delayWhen(({ isFromFile }) => (isFromFile ? timer(UPDATE_TIMEOUT_MS) : of(null))),
      ),
      controller.assemble,
    )
  }, [controller])

  useEffect(() => {
    const setAssemblerState$ = store.onAction(setAssemblerState)
    const setAssemblerError$ = store.onAction(setAssemblerError)
    return observe(merge(setAssemblerState$, setAssemblerError$), controller.reset)
  }, [controller])

  useEffect(() => {
    const runtimeConfiguration$ = store.onState(selectRuntimeConfiguration)
    return observe(
      runtimeConfiguration$.pipe(
        filter(() => {
          // `setSuspended` action listener will resume the main loop with new configuration
          // so we skip calling `stopAndRun` if cpu is suspended
          return store.getState(selectIsRunning) && !store.getState(selectIsSuspended)
        }),
      ),
      controller.stopAndRun,
    )
  }, [controller])

  return controller
}
