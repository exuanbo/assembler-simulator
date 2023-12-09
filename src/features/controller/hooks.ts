import { useEffect } from 'react'
import { debounceTime, filter } from 'rxjs'

import { applySelector, store } from '@/app/store'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'
import { useSingleton } from '@/common/hooks'
import { observe } from '@/common/observe'
import { selectIsAssembled, setAssemblerState } from '@/features/assembler/assemblerSlice'
import { setEditorInput } from '@/features/editor/editorSlice'

import {
  selectIsRunning,
  selectIsSuspended,
  selectRuntimeConfiguration,
  setAutoAssemble,
} from './controllerSlice'
import { Controller } from './core'

export const useController = (): Controller => {
  const controller = useSingleton(() => new Controller())

  useEffect(() => {
    const setEditorInput$ = store.onAction(setEditorInput)
    return observe(setEditorInput$, controller.resetSelf)
  }, [controller])

  useEffect(() => {
    const setAutoAssemble$ = store.onAction(setAutoAssemble)
    return observe(
      setAutoAssemble$.pipe(
        debounceTime(UPDATE_TIMEOUT_MS),
        filter((shouldAutoAssemble) => shouldAutoAssemble && !applySelector(selectIsAssembled)),
      ),
      controller.assemble,
    )
  }, [controller])

  useEffect(() => {
    const setAssemblerState$ = store.onAction(setAssemblerState)
    return observe(setAssemblerState$, controller.resetSelf)
  }, [controller])

  useEffect(() => {
    const runtimeConfiguration$ = store.onState(selectRuntimeConfiguration)
    return observe(
      runtimeConfiguration$.pipe(
        filter(() => {
          // `setSuspended` action listener will resume the main loop with new configuration
          // so we skip calling `stopAndRun` if cpu is suspended
          return applySelector(selectIsRunning) && !applySelector(selectIsSuspended)
        }),
      ),
      controller.stopAndRun,
    )
  }, [controller])

  return controller
}
