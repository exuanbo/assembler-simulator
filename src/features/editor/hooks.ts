import { useEffect, useRef } from 'react'
import type { Store } from '@/app/store'
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
import { useCodeMirrorView } from './codemirror/hooks'
import { ViewUpdateListener, addViewUpdateListener } from './codemirror/viewUpdateListener'
import { wavyUnderlineEffect } from './codemirror/wavyUnderline'
import { highlightLineEffect } from './codemirror/highlightLine'
import { breakpointEffect, getBreakpointSet, breakpointsEqual } from './codemirror/breakpoints'
import { StringAnnotation, hasStringAnnotation } from './codemirror/annotations'
import { textToString, lineLocAt, lineRangesEqual } from './codemirror/text'
import { mapRangeSetToArray } from './codemirror/rangeSet'
import { selectAutoAssemble } from '@/features/controller/controllerSlice'
import { createAssemble } from '@/features/assembler/assemble'
import {
  selectAssemblerError,
  selectAssemblerErrorRange,
  clearAssemblerError
} from '@/features/assembler/assemblerSlice'
import { selectCpuFault, setCpuHalted, resetCpuState } from '@/features/cpu/cpuSlice'
import { useConstant } from '@/common/hooks'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'

enum AnnotationValue {
  ChangedFromState = 'ChangedFromState'
}

const isChangedFromState = hasStringAnnotation(AnnotationValue.ChangedFromState)

const createInputUpdateListener = (store: Store): ViewUpdateListener => {
  let timeoutId: number | undefined

  return viewUpdate => {
    if (!viewUpdate.docChanged) {
      return
    }
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
      timeoutId = undefined
    }
    // document changes must be caused by at least one transaction
    const firstTransaction = viewUpdate.transactions[0]
    // only one transaction is dispatched if input is set from file
    if (isChangedFromState(firstTransaction)) {
      return
    }
    const input = textToString(viewUpdate.state.doc)
    timeoutId = window.setTimeout(() => {
      store.dispatch(setEditorInput({ value: input }))
      timeoutId = undefined
    }, UPDATE_TIMEOUT_MS)
  }
}

export const useSyncInput = (): void => {
  const view = useCodeMirrorView()
  const store = useStore()

  useEffect(() => {
    if (view === undefined) {
      return
    }
    view.dispatch(addViewUpdateListener(createInputUpdateListener(store)))
    return listenAction(setEditorInput, ({ value, isFromFile }) => {
      if (isFromFile) {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: value
          },
          annotations: StringAnnotation.of(AnnotationValue.ChangedFromState)
        })
        view.contentDOM.blur()
      }
    })
  }, [view])
}

export const useAutoFocus = (): void => {
  const view = useCodeMirrorView()

  useEffect(() => {
    if (view === undefined) {
      return
    }
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
  }, [view])
}

export const useAutoAssemble = (): void => {
  const view = useCodeMirrorView()
  const store = useStore()
  const assemble = useConstant(() => createAssemble(store))

  useEffect(() => {
    if (view !== undefined && selectAutoAssemble(store.getState())) {
      window.setTimeout(() => {
        assemble(textToString(view.state.doc))
      }, UPDATE_TIMEOUT_MS)
    }
  }, [view])

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
  const view = useCodeMirrorView()
  const store = useStore()

  useEffect(() => {
    if (view === undefined) {
      return
    }
    view.dispatch(
      addViewUpdateListener(viewUpdate => {
        if (viewUpdate.docChanged && selectAssemblerError(store.getState()) !== null) {
          store.dispatch(clearAssemblerError())
        }
      })
    )
    return watch(selectAssemblerErrorRange, errorRange => {
      const hasError = errorRange !== undefined
      view.dispatch({
        effects: wavyUnderlineEffect.of({
          add: errorRange,
          filter: () => hasError
        })
      })
    })
  }, [view])
}

export const useHighlightLine = (): void => {
  const view = useCodeMirrorView()

  useEffect(() => {
    return listenAction(setEditorInput, ({ isFromFile }, api) => {
      if (isFromFile) {
        api.dispatch(clearEditorHighlightRange())
      }
    })
  }, [])

  useEffect(() => {
    if (view === undefined) {
      return
    }
    return watch(selectEditorHighlightLinePos(view), linePos => {
      const shouldAddHighlight = linePos !== undefined
      view.dispatch({
        effects: shouldAddHighlight
          ? linePos.map((pos, index) =>
              highlightLineEffect.of({
                addByPos: pos,
                // clear previous decorations on first line
                filter: () => index !== 0
              })
            )
          : highlightLineEffect.of({ filter: () => false })
      })
      if (!view.hasFocus && shouldAddHighlight) {
        view.dispatch({
          // length of `linePos` is already checked
          selection: { anchor: linePos[0] },
          scrollIntoView: true
        })
        view.contentDOM.blur()
      }
    })
  }, [view])
}

const createBreakpointsUpdateListener =
  (store: Store): ViewUpdateListener =>
  viewUpdate => {
    if (viewUpdate.docChanged) {
      const breakpointSet = getBreakpointSet(viewUpdate.state)
      if (!breakpointsEqual(getBreakpointSet(viewUpdate.startState), breakpointSet)) {
        const breakpoints = mapRangeSetToArray(breakpointSet, from =>
          lineLocAt(viewUpdate.state.doc, from)
        )
        store.dispatch(setBreakpoints(breakpoints))
      }
    } else {
      // we only consider the first transaction
      const transaction = viewUpdate.transactions[0]
      if (transaction === undefined || isChangedFromState(transaction)) {
        return
      }
      transaction.effects.forEach(effect => {
        if (effect.is(breakpointEffect)) {
          const actionCreator = effect.value.on ? addBreakpoint : removeBreakpoint
          const lineLoc = lineLocAt(viewUpdate.state.doc, effect.value.pos)
          store.dispatch(actionCreator(lineLoc))
        }
      })
    }
  }

export const useBreakpoints = (): void => {
  const view = useCodeMirrorView()
  const store = useStore()

  useEffect(() => {
    if (view === undefined) {
      return
    }
    view.dispatch(addViewUpdateListener(createBreakpointsUpdateListener(store)))
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
    view.dispatch({
      effects: validBreakpoints.map(lineLoc =>
        breakpointEffect.of({
          pos: lineLoc.from,
          on: true
        })
      ),
      annotations: StringAnnotation.of(AnnotationValue.ChangedFromState)
    })
  }, [view])
}

const MESSAGE_DURATION_MS = 2000

const haltedMessage: EditorMessage = {
  type: MessageType.Info,
  content: 'Info: Program has halted.'
}

const errorToMessage = (err: Error): EditorMessage => {
  return {
    type: MessageType.Error,
    content: `${err.name}: ${err.message}`
  }
}

export const useMessage = (): EditorMessage | null => {
  const assemblerError = useSelector(selectAssemblerError)
  const runtimeError = useSelector(selectCpuFault)

  const err = assemblerError ?? runtimeError

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

  if (err !== null) {
    return errorToMessage(err)
  }
  return message
}
