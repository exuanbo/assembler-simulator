import { useEffect, useContext, useRef } from 'react'
import CodeMirrorContext from './CodeMirrorContext'
import type { Store } from '@/app/store'
import { listenAction } from '@/app/actionListener'
import { useStore, useSelector } from '@/app/hooks'
import {
  MessageType,
  EditorMessage,
  selectEditorBreakpoints,
  selectEditorActiveLinePos,
  selectEditorMessage,
  setEditorInput,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint,
  clearEditorActiveRange,
  setEditorMessage,
  clearEditorMessage
} from './editorSlice'
import { ViewUpdateListener, addViewUpdateListener } from './codemirror/viewUpdateListener'
import { wavyUnderlineEffect } from './codemirror/wavyUnderline'
import { highlightLineEffect } from './codemirror/highlightLine'
import { breakpointEffect, getBreakpointRangeSet, breakpointsEqual } from './codemirror/breakpoints'
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
import { selectCpuFault, setCpuHalted, resetCpu } from '@/features/cpu/cpuSlice'
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
    // document changes must be caused by at least one transaction
    const firstTransaction = viewUpdate.transactions[0]
    const input = textToString(viewUpdate.state.doc)
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => {
      // only one transaction is dispatched if input is set from file
      if (!isChangedFromState(firstTransaction)) {
        store.dispatch(setEditorInput({ value: input }))
      }
      timeoutId = undefined
    }, UPDATE_TIMEOUT_MS)
  }
}

export const useSyncInput = (): void => {
  const view = useContext(CodeMirrorContext)
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
      }
    })
  }, [view])
}

export const useAutoAssemble = (): void => {
  const view = useContext(CodeMirrorContext)

  const store = useStore()
  const assemble = useConstant(() => createAssemble(store))

  useEffect(() => {
    if (view !== undefined && selectAutoAssemble(store.getState())) {
      assemble(textToString(view.state.doc))
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
  const view = useContext(CodeMirrorContext)

  const store = useStore()

  useEffect(() => {
    view?.dispatch(
      addViewUpdateListener(viewUpdate => {
        if (selectAssemblerError(store.getState()) !== null && viewUpdate.docChanged) {
          viewUpdate.view.dispatch({
            effects: wavyUnderlineEffect.of({ filter: () => false })
          })
          store.dispatch(clearAssemblerError())
        }
      })
    )
  }, [view])

  const assemblerErrorRange = useSelector(selectAssemblerErrorRange)

  useEffect(() => {
    view?.dispatch({
      effects: wavyUnderlineEffect.of({
        add: assemblerErrorRange,
        filter: () => assemblerErrorRange !== undefined
      })
    })
  }, [view, assemblerErrorRange])
}

export const useHighlightActiveLine = (): void => {
  const view = useContext(CodeMirrorContext)

  useEffect(() => {
    return listenAction(setEditorInput, ({ isFromFile }, api) => {
      if (isFromFile) {
        api.dispatch(clearEditorActiveRange())
      }
    })
  }, [])

  const activeLinePos = useSelector(selectEditorActiveLinePos(view))

  useEffect(() => {
    view?.dispatch({
      effects:
        activeLinePos === undefined
          ? highlightLineEffect.of({ filter: () => false })
          : activeLinePos.map((pos, index) =>
              highlightLineEffect.of({
                addByPos: pos,
                // clear previous decorations on first line
                filter: () => index !== 0
              })
            ),
      ...(view.hasFocus || activeLinePos === undefined
        ? undefined
        : {
            // length of `activeLinePos` is already checked
            selection: { anchor: activeLinePos[0] },
            scrollIntoView: true
          })
    })
  }, [view, activeLinePos])
}

const createBreakpointsUpdateListener =
  (store: Store): ViewUpdateListener =>
  viewUpdate => {
    if (viewUpdate.docChanged) {
      const breakpointRangeSet = getBreakpointRangeSet(viewUpdate.state)
      if (!breakpointsEqual(getBreakpointRangeSet(viewUpdate.startState), breakpointRangeSet)) {
        const breakpoints = mapRangeSetToArray(breakpointRangeSet, from =>
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
  const view = useContext(CodeMirrorContext)

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

const getMessageFrom = (err: Error | null): EditorMessage | null =>
  err === null
    ? null
    : {
        type: MessageType.Error,
        content: `${err.name}: ${err.message}`
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
    return listenAction(resetCpu, (_, api) => {
      if (selectEditorMessage(api.getState()) === haltedMessage) {
        window.clearTimeout(messageTimeoutIdRef.current)
        messageTimeoutIdRef.current = undefined
        api.dispatch(clearEditorMessage())
      }
    })
  }, [])

  return getMessageFrom(err) ?? message
}
