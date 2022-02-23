import { useState, useEffect, useRef } from 'react'
import { Transaction, StateEffect, Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { getState, dispatch, listenAction } from '@/app/store'
import { useSelector } from '@/app/hooks'
import {
  selectEditortInput,
  selectEditorBreakpoints,
  selectEditorActiveLinePos,
  setEditorInput,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint,
  clearEditorActiveRange
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
import { useConstant } from '@/common/hooks'

enum AnnotationValue {
  ChangedFromState = 'ChangedFromState'
}

const isChangedFromState = (transation: Transaction): boolean =>
  transation.annotation(StringAnnotation) === AnnotationValue.ChangedFromState

const createInputUpdateListener = (): ViewUpdateListener => {
  let updateInputTimeoutId: number | undefined

  return viewUpdate => {
    if (!viewUpdate.docChanged) {
      return
    }
    // document changes must be caused by at least one transaction
    const firstTransaction = viewUpdate.transactions[0]
    const input = viewUpdate.state.doc.sliceString(0)
    if (updateInputTimeoutId !== undefined) {
      window.clearTimeout(updateInputTimeoutId)
    }
    updateInputTimeoutId = window.setTimeout(() => {
      // only one transaction is dispatched if input is set from file
      if (!isChangedFromState(firstTransaction)) {
        dispatch(setEditorInput({ value: input }))
      }
      updateInputTimeoutId = undefined
    }, 250)
  }
}

export const useCodeMirror = (): ReturnType<typeof __useCodeMirror> => {
  const defaultInput = useConstant(() => selectEditortInput(getState()))

  const editorStateConfig = useConstant(() => ({
    doc: defaultInput,
    extensions: setup
  }))

  const inputUpdateListener = useConstant(createInputUpdateListener)

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
    return listenAction(setEditorInput, ({ value, isFromFile = false }) => {
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

const addViewUpdateListener = (viewUpdateListener: ViewUpdateListener): StateEffect<Extension> =>
  StateEffect.appendConfig.of(EditorView.updateListener.of(viewUpdateListener))

export const useAutoAssemble = (): void => {
  useEffect(() => {
    return listenAction(setEditorInput, ({ value }) => {
      if (selectAutoAssemble(getState())) {
        assemble(value)
      }
    })
  }, [])
}

export const useAssemblerError = (view: EditorView | undefined): void => {
  useEffect(() => {
    view?.dispatch({
      effects: addViewUpdateListener(viewUpdate => {
        if (selectAssemblerError(getState()) !== null && viewUpdate.docChanged) {
          viewUpdate.view.dispatch({
            effects: wavyUnderlineEffect.of({ filter: () => false })
          })
          dispatch(clearAssemblerError())
        }
      })
    })
  }, [view])

  const assemblerErrorRange = useSelector(selectAssemblerErrorRange)

  useEffect(() => {
    view?.dispatch({
      effects: wavyUnderlineEffect.of({ add: assemblerErrorRange })
    })
  }, [view, assemblerErrorRange])
}

export const useHighlightActiveLine = (view: EditorView | undefined): void => {
  useEffect(() => {
    return listenAction(setEditorInput, ({ isFromFile = false }) => {
      if (isFromFile && !selectAutoAssemble(getState())) {
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
    view.dispatch({ effects: addViewUpdateListener(breakpointsUpdateListener) })
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

export enum MessageType {
  Info,
  Error
}

interface StatusMessage {
  type: MessageType
  content: string
}

const haltedMessage: StatusMessage = {
  type: MessageType.Info,
  content: 'Info: Program has halted.'
}

const getStatusMessageFrom = (err: Error | null): StatusMessage | null =>
  err === null
    ? null
    : {
        type: MessageType.Error,
        content: `${err.name}: ${err.message}`
      }

export const useStatusMessage = (): StatusMessage | null => {
  const assemblerError = useSelector(selectAssemblerError)
  const runtimeError = useSelector(selectCpuFault)

  const err = assemblerError ?? runtimeError

  const [shouldShowHalted, setShouldShowHalted] = useState(false)
  const showHaltedTimeoutIdRef = useRef<number | undefined>()

  useEffect(() => {
    return listenAction(setCpuHalted, () => {
      setShouldShowHalted(true)
      window.clearTimeout(showHaltedTimeoutIdRef.current)
      showHaltedTimeoutIdRef.current = window.setTimeout(() => {
        setShouldShowHalted(false)
        showHaltedTimeoutIdRef.current = undefined
      }, 2000)
    })
  }, [])

  useEffect(() => {
    return listenAction(resetCpu, () => {
      setShouldShowHalted(false)
      if (showHaltedTimeoutIdRef.current !== undefined) {
        window.clearTimeout(showHaltedTimeoutIdRef.current)
        showHaltedTimeoutIdRef.current = undefined
      }
    })
  }, [])

  return getStatusMessageFrom(err) ?? (shouldShowHalted ? haltedMessage : null)
}
