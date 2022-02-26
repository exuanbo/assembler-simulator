import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { StateEffect, Transaction, TransactionSpec } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { getState, dispatch, listenAction } from '@/app/store'
import { useSelector } from '@/app/hooks'
import {
  MessageType,
  EditorMessage,
  selectEditorInput,
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
import { ViewUpdateListener, useCodeMirror as __useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'
import { wavyUnderlineEffect } from './codemirror/wavyUnderline'
import { highlightLineEffect } from './codemirror/highlightLine'
import { breakpointEffect, getBreakpointRangeSet, breakpointsEqual } from './codemirror/breakpoints'
import { StringAnnotation } from './codemirror/annotations'
import { lineLocAt, lineRangesEqual } from './codemirror/line'
import { mapRangeSetToArray } from './codemirror/rangeSet'
import { selectAutoAssemble } from '@/features/controller/controllerSlice'
import { assemble } from '@/features/assembler/assemble'
import {
  selectAssemblerError,
  selectAssemblerErrorRange,
  clearAssemblerError
} from '@/features/assembler/assemblerSlice'
import { selectCpuFault, setCpuHalted, resetCpu } from '@/features/cpu/cpuSlice'

const TIMEOUT_MS = 250

enum AnnotationValue {
  ChangedFromState = 'ChangedFromState'
}

const isChangedFromState = (transation: Transaction): boolean =>
  transation.annotation(StringAnnotation) === AnnotationValue.ChangedFromState

const createInputUpdateListener =
  (timeoutIdRef: MutableRefObject<number | undefined>): ViewUpdateListener =>
  viewUpdate => {
    if (!viewUpdate.docChanged) {
      return
    }
    // document changes must be caused by at least one transaction
    const firstTransaction = viewUpdate.transactions[0]
    const input = viewUpdate.state.doc.sliceString(0)
    if (timeoutIdRef.current !== undefined) {
      window.clearTimeout(timeoutIdRef.current)
    }
    timeoutIdRef.current = window.setTimeout(() => {
      // only one transaction is dispatched if input is set from file
      if (!isChangedFromState(firstTransaction)) {
        dispatch(setEditorInput({ value: input }))
      }
      timeoutIdRef.current = undefined
    }, TIMEOUT_MS)
  }

export const useCodeMirror = (): ReturnType<typeof __useCodeMirror> => {
  const defaultInput = useMemo(() => selectEditorInput(getState()), [])

  const editorStateConfig = useMemo(() => {
    return {
      doc: defaultInput,
      extensions: setup
    }
  }, [defaultInput])

  const timeoutIdRef = useRef<number | undefined>()
  const inputUpdateListener = useMemo(() => createInputUpdateListener(timeoutIdRef), [])

  const { view, editorRef } = __useCodeMirror<HTMLDivElement>(
    editorStateConfig,
    inputUpdateListener
  )

  useEffect(() => {
    if (view === undefined) {
      return
    }
    if (selectAutoAssemble(getState())) {
      assemble(defaultInput)
    }
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

  return { view, editorRef }
}

const addViewUpdateListener = (viewUpdateListener: ViewUpdateListener): TransactionSpec => {
  return {
    effects: StateEffect.appendConfig.of(EditorView.updateListener.of(viewUpdateListener))
  }
}

export const useAutoAssemble = (): void => {
  useEffect(() => {
    return listenAction(setEditorInput, ({ value, isFromFile }) => {
      if (selectAutoAssemble(getState())) {
        if (isFromFile) {
          window.setTimeout(() => {
            assemble(value)
          }, TIMEOUT_MS)
        } else {
          assemble(value)
        }
      }
    })
  }, [])
}

export const useAssemblerError = (view: EditorView | undefined): void => {
  useEffect(() => {
    view?.dispatch(
      addViewUpdateListener(viewUpdate => {
        if (selectAssemblerError(getState()) !== null && viewUpdate.docChanged) {
          viewUpdate.view.dispatch({
            effects: wavyUnderlineEffect.of({ filter: () => false })
          })
          dispatch(clearAssemblerError())
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

const breakpointsUpdateListener: ViewUpdateListener = viewUpdate => {
  if (viewUpdate.docChanged) {
    const breakpointRangeSet = getBreakpointRangeSet(viewUpdate.state)
    if (!breakpointsEqual(getBreakpointRangeSet(viewUpdate.startState), breakpointRangeSet)) {
      const breakpoints = mapRangeSetToArray(breakpointRangeSet, from =>
        lineLocAt(viewUpdate.state.doc, from)
      )
      dispatch(setBreakpoints(breakpoints))
    }
  } else {
    // we only consider the first transaction
    const transaction = viewUpdate.transactions[0] as Transaction | undefined
    if (transaction === undefined || isChangedFromState(transaction)) {
      return
    }
    transaction.effects.forEach(effect => {
      if (effect.is(breakpointEffect)) {
        const actionCreator = effect.value.on ? addBreakpoint : removeBreakpoint
        const lineLoc = lineLocAt(viewUpdate.state.doc, effect.value.pos)
        dispatch(actionCreator(lineLoc))
      }
    })
  }
}

export const useBreakpoints = (view: EditorView | undefined): void => {
  useEffect(() => {
    if (view === undefined) {
      return
    }
    view.dispatch(addViewUpdateListener(breakpointsUpdateListener))
    const breakpoints = selectEditorBreakpoints(getState())
    // persisted state might not be in sync with codemirror
    const validBreakpoints = breakpoints.filter(
      lineLoc =>
        lineLoc.to <= view.state.doc.length &&
        lineRangesEqual(lineLoc, lineLocAt(view.state.doc, lineLoc.from))
    )
    if (validBreakpoints.length < breakpoints.length) {
      dispatch(setBreakpoints(validBreakpoints))
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

export const useHighlightActiveLine = (view: EditorView | undefined): void => {
  useEffect(() => {
    return listenAction(setEditorInput, ({ isFromFile }) => {
      if (isFromFile) {
        dispatch(clearEditorActiveRange())
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
                // clear all decorations on first line
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
    return listenAction(setEditorMessage, () => {
      if (messageTimeoutIdRef.current !== undefined) {
        window.clearTimeout(messageTimeoutIdRef.current)
      }
      messageTimeoutIdRef.current = window.setTimeout(() => {
        dispatch(clearEditorMessage())
        messageTimeoutIdRef.current = undefined
      }, MESSAGE_DURATION_MS)
    })
  }, [])

  useEffect(() => {
    return listenAction(setCpuHalted, () => {
      dispatch(setEditorMessage(haltedMessage))
    })
  }, [])

  useEffect(() => {
    return listenAction(resetCpu, () => {
      if (selectEditorMessage(getState()) === haltedMessage) {
        window.clearTimeout(messageTimeoutIdRef.current)
        messageTimeoutIdRef.current = undefined
        dispatch(clearEditorMessage())
      }
    })
  }, [])

  return getMessageFrom(err) ?? message
}
