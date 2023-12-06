import { useEffect } from 'react'
import { debounceTime, filter } from 'rxjs'

import { applySelector } from '@/app/selector'
import { store } from '@/app/store'
import { subscribe } from '@/app/subscribe'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'
import { useSingleton } from '@/common/hooks'
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
    return subscribe(setEditorInput$, controller.resetSelf)
  }, [controller])

  useEffect(() => {
    const setAutoAssemble$ = store.onAction(setAutoAssemble)
    return subscribe(
      setAutoAssemble$.pipe(
        debounceTime(UPDATE_TIMEOUT_MS),
        filter((shouldAutoAssemble) => shouldAutoAssemble && !applySelector(selectIsAssembled)),
      ),
      controller.assemble,
    )
  }, [controller])

  useEffect(() => {
    const setAssemblerState$ = store.onAction(setAssemblerState)
    return subscribe(setAssemblerState$, controller.resetSelf)
  }, [controller])

  useEffect(() => {
    const runtimeConfiguration$ = store.onState(selectRuntimeConfiguration)
    return subscribe(
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
