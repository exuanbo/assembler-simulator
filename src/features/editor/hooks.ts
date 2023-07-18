import { useEffect, useRef } from 'react'
import { addUpdateListener } from '@codemirror-toolkit/extensions'
import { rangeSetsEqual, mapRangeSetToArray } from '@codemirror-toolkit/utils'
import { listenAction } from '@/app/actionListener'
import { watch } from '@/app/watcher'
import { useStore, useSelector } from '@/app/hooks'
import {
  MessageType,
  EditorMessage,
  selectEditorHighlightLinePos,
  selectEditorBreakpoints,
  selectEditorMessage,
  setEditorInput,
  clearEditorHighlightRange,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint,
  setEditorMessage,
  clearEditorMessage
} from './editorSlice'
import { template } from './examples'
import { useViewEffect } from './codemirror/hooks'
import { WavyUnderlineEffect } from './codemirror/wavyUnderline'
import { HighlightLineEffect } from './codemirror/highlightLine'
import { BreakpointEffect, getBreakpointSet } from './codemirror/breakpoints'
import { withStringAnnotation, hasStringAnnotation } from './codemirror/annotations'
import { textToString, lineLocAt, lineRangesEqual } from './codemirror/text'
import { selectAutoAssemble } from '@/features/controller/controllerSlice'
import { createAssemble } from '@/features/assembler/assemble'
import {
  selectAssemblerError,
  selectAssemblerErrorRange,
  clearAssemblerError
} from '@/features/assembler/assemblerSlice'
import { selectCpuFault, setCpuHalted, resetCpuState } from '@/features/cpu/cpuSlice'
import { useSingleton } from '@/common/hooks'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'

enum AnnotationValue {
  SyncFromState = 'SyncFromState'
}

const syncFromState = withStringAnnotation(AnnotationValue.SyncFromState)
const isSyncFromState = hasStringAnnotation(AnnotationValue.SyncFromState)

export const useSyncInput = (): void => {
  const store = useStore()

  useViewEffect(view => {
    let syncInputTimeoutId: number | undefined
    return addUpdateListener(view, update => {
      if (!update.docChanged) {
        return
      }
      if (syncInputTimeoutId !== undefined) {
        window.clearTimeout(syncInputTimeoutId)
        syncInputTimeoutId = undefined
      }
      // document changes must be caused by at least one transaction
      const firstTransaction = update.transactions[0]
      // only one transaction is dispatched if input is set from file
      if (isSyncFromState(firstTransaction)) {
        return
      }
      const input = textToString(update.state.doc)
      syncInputTimeoutId = window.setTimeout(() => {
        store.dispatch(setEditorInput({ value: input }))
        syncInputTimeoutId = undefined
      }, UPDATE_TIMEOUT_MS)
    })
  }, [])

  useViewEffect(view => {
    return listenAction(setEditorInput, ({ value, isFromFile }) => {
      if (isFromFile) {
        view.dispatch(
          syncFromState({
            changes: {
              from: 0,
              to: view.state.doc.length,
              insert: value
            }
          })
        )
      }
    })
  }, [])
}

export const useAutoFocus = (): void => {
  useViewEffect(view => {
    return listenAction(setEditorInput, ({ value, isFromFile }) => {
      if (isFromFile && value === template.content) {
        view.focus()
        const { title, content } = template
        const titleIndex = content.indexOf(title)
        view.dispatch({
          selection: {
            anchor: titleIndex,
            head: titleIndex + title.length
          }
        })
      }
    })
  }, [])
}

export const useAutoAssemble = (): void => {
  const store = useStore()
  const assemble = useSingleton(() => createAssemble(store))

  useViewEffect(view => {
    let initialAssembleTimeoutId: number | undefined = window.setTimeout(() => {
      if (selectAutoAssemble(store.getState())) {
        assemble(textToString(view.state.doc))
      }
      initialAssembleTimeoutId = undefined
    }, UPDATE_TIMEOUT_MS)
    return () => {
      if (initialAssembleTimeoutId !== undefined) {
        window.clearTimeout(initialAssembleTimeoutId)
      }
    }
  }, [])

  useEffect(() => {
    return listenAction(setEditorInput, ({ value, isFromFile }, api) => {
      if (selectAutoAssemble(api.getState())) {
        if (isFromFile) {
          window.setTimeout(() => {
            assemble(value)
          }, UPDATE_TIMEOUT_MS)
        } else {
          assemble(value)
        }
      }
    })
  }, [])
}

export const useAssemblerError = (): void => {
  const store = useStore()

  useViewEffect(view => {
    return addUpdateListener(view, update => {
      if (update.docChanged && selectAssemblerError(store.getState()) !== null) {
        store.dispatch(clearAssemblerError())
      }
    })
  }, [])

  useViewEffect(view => {
    return watch(selectAssemblerErrorRange, errorRange => {
      const hasError = errorRange !== undefined
      view.dispatch({
        effects: WavyUnderlineEffect.of({
          add: errorRange,
          filter: () => hasError
        })
      })
    })
  }, [])
}

export const useHighlightLine = (): void => {
  useEffect(() => {
    return listenAction(setEditorInput, ({ isFromFile }, api) => {
      if (isFromFile) {
        api.dispatch(clearEditorHighlightRange())
      }
    })
  }, [])

  useViewEffect(view => {
    return watch(selectEditorHighlightLinePos(view), linePos => {
      const shouldAddHighlight = linePos !== undefined
      view.dispatch({
        effects: shouldAddHighlight
          ? linePos.map((pos, posIndex) =>
              HighlightLineEffect.of({
                addByPos: pos,
                // clear previous decorations on first line
                filter: () => posIndex !== 0
              })
            )
          : HighlightLineEffect.of({ filter: () => false })
      })
      if (!view.hasFocus && shouldAddHighlight) {
        view.dispatch({
          // length of `linePos` is already checked
          selection: { anchor: linePos[0] },
          scrollIntoView: true
        })
      }
    })
  }, [])
}

export const useBreakpoints = (): void => {
  const store = useStore()

  useViewEffect(view => {
    return addUpdateListener(view, update => {
      if (update.docChanged) {
        const breakpointSet = getBreakpointSet(update.state)
        if (!rangeSetsEqual(breakpointSet, getBreakpointSet(update.startState))) {
          const breakpoints = mapRangeSetToArray(breakpointSet, (_, from) =>
            lineLocAt(update.state.doc, from)
          )
          store.dispatch(setBreakpoints(breakpoints))
        }
      } else {
        // we only consider the first transaction
        const transaction = update.transactions[0]
        if (transaction === undefined || isSyncFromState(transaction)) {
          return
        }
        transaction.effects.forEach(effect => {
          if (effect.is(BreakpointEffect)) {
            const actionCreator = effect.value.on ? addBreakpoint : removeBreakpoint
            const lineLoc = lineLocAt(update.state.doc, effect.value.pos)
            store.dispatch(actionCreator(lineLoc))
          }
        })
      }
    })
  }, [])

  useViewEffect(view => {
    const breakpoints = selectEditorBreakpoints(store.getState())
    // persisted state might not be in sync with codemirror
    const validBreakpoints = breakpoints.filter(
      lineLoc =>
        lineLoc.to <= view.state.doc.length &&
        lineRangesEqual(lineLoc, lineLocAt(view.state.doc, lineLoc.from))
    )
    if (validBreakpoints.length < breakpoints.length) {
      store.dispatch(setBreakpoints(validBreakpoints))
    }
    if (validBreakpoints.length === 0) {
      return
    }
    const breakpointSet = getBreakpointSet(view.state)
    if (breakpointSet.size === 0) {
      view.dispatch(
        syncFromState({
          effects: validBreakpoints.map(lineLoc =>
            BreakpointEffect.of({
              pos: lineLoc.from,
              on: true
            })
          )
        })
      )
    }
  }, [])
}

const MESSAGE_DURATION_MS = 2000

const haltedMessage: EditorMessage = {
  type: MessageType.Info,
  content: 'Info: Program has halted.'
}

const errorToMessage = (error: Error): EditorMessage => {
  return {
    type: MessageType.Error,
    content: `${error.name}: ${error.message}`
  }
}

export const useMessage = (): EditorMessage | null => {
  const assemblerError = useSelector(selectAssemblerError)
  const runtimeError = useSelector(selectCpuFault)

  const error = assemblerError ?? runtimeError

  const message = useSelector(selectEditorMessage)
  const messageTimeoutIdRef = useRef<number | undefined>()

  useEffect(() => {
    return listenAction(setEditorMessage, (_, api) => {
      if (messageTimeoutIdRef.current !== undefined) {
        window.clearTimeout(messageTimeoutIdRef.current)
      }
      messageTimeoutIdRef.current = window.setTimeout(() => {
        api.dispatch(clearEditorMessage())
        messageTimeoutIdRef.current = undefined
      }, MESSAGE_DURATION_MS)
    })
  }, [])

  useEffect(() => {
    return listenAction(setCpuHalted, (_, api) => {
      api.dispatch(setEditorMessage(haltedMessage))
    })
  }, [])

  useEffect(() => {
    return listenAction(resetCpuState, (_, api) => {
      if (selectEditorMessage(api.getState()) === haltedMessage) {
        window.clearTimeout(messageTimeoutIdRef.current)
        messageTimeoutIdRef.current = undefined
        api.dispatch(clearEditorMessage())
      }
    })
  }, [])

  if (error !== null) {
    return errorToMessage(error)
  }
  return message
}
