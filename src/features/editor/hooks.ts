import { createCodeMirror } from '@codemirror-toolkit/react'
import { useEffect } from 'react'
import { debounceTime, filter, first, map, merge, switchMap } from 'rxjs'

import { applySelector, store, useSelector } from '@/app/store'
import * as Maybe from '@/common/maybe'
import { observe } from '@/common/observe'
import { selectAssemblerError } from '@/features/assembler/assemblerSlice'
import { resetCpuState, selectCpuFault, setCpuHalted } from '@/features/cpu/cpuSlice'

import { setException } from '../exception/exceptionSlice'
import { type ExceptionHandler, exceptionSink } from './codemirror/exceptionSink'
import { setup } from './codemirror/setup'
import {
  clearEditorMessage,
  type EditorMessage,
  MessageType,
  selectEditorInput,
  selectEditorMessage,
  setEditorMessage,
} from './editorSlice'

export const { useViewEffect, useContainerRef } = createCodeMirror<HTMLDivElement>(() => {
  const editorInput = applySelector(selectEditorInput)
  const handleException: ExceptionHandler = (exception) => {
    store.dispatch(setException(exception))
  }
  return {
    doc: editorInput,
    extensions: [setup(), exceptionSink(handleException)],
  }
})

const MESSAGE_DURATION_MS = 2000

const haltedMessage: EditorMessage = {
  type: MessageType.Info,
  content: 'Info: Program has halted.',
}

const errorToMessage = (error: Error): EditorMessage => {
  return {
    type: MessageType.Error,
    content: `${error.name}: ${error.message}`,
  }
}

export const useMessage = (): EditorMessage | null => {
  const assemblerError = useSelector(selectAssemblerError)
  const runtimeError = useSelector(selectCpuFault)

  const error = assemblerError ?? runtimeError

  const message = useSelector(selectEditorMessage)

  useEffect(() => {
    const message$ = store.onState(selectEditorMessage)
    const setCpuHalted$ = store.onAction(setCpuHalted)
    const resetCpuState$ = store.onAction(resetCpuState)
    return observe(
      merge(
        setCpuHalted$.pipe(map(() => setEditorMessage(haltedMessage))),
        resetCpuState$.pipe(
          switchMap(() => message$.pipe(first())),
          filter((msg) => msg === haltedMessage),
          map(() => clearEditorMessage()),
        ),
      ),
      (action) => store.dispatch(action),
    )
  }, [])

  useEffect(() => {
    const setEditorMessage$ = store.onAction(setEditorMessage)
    return observe(
      setEditorMessage$.pipe(
        debounceTime(MESSAGE_DURATION_MS),
        filter(Boolean),
        filter(({ type }) => type !== MessageType.Error),
        map(() => clearEditorMessage()),
      ),
      (action) => store.dispatch(action),
    )
  }, [])

  return Maybe.fromNullable(error).map(errorToMessage).orDefault(message)
}
