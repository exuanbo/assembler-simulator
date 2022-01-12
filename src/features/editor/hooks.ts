import { useState, useEffect, useRef } from 'react'
import { Transaction, StateEffect } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { getState, dispatch, listenAction } from '../../app/store'
import { useSelector } from '../../app/hooks'
import {
  selectEditortInput,
  selectEditorBreakpoints,
  selectEditorActiveLinePos,
  setEditorInput,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint
} from './editorSlice'
import { ViewUpdateListener, useCodeMirror as __useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'
import { breakpointEffect, getBreakpoints, breakpointsChanged } from './codemirror/breakpoints'
import { highlightLineEffect } from './codemirror/highlightLine'
import { wavyUnderlineEffect } from './codemirror/wavyUnderline'
import { StringAnnotation } from './codemirror/annotations'
import { lineRangeAt, lineRangesEqual } from './codemirror/line'
import { mapRangeSetToArray } from './codemirror/rangeSet'
import { selectAutoAssemble } from '../controller/controllerSlice'
import { assemble } from '../assembler/assemble'
import { selectAssemblerError, selectAssemblerErrorRange } from '../assembler/assemblerSlice'
import { selectCpuFault, setCpuHalted, resetCpu } from '../cpu/cpuSlice'
import { useConstant } from '../../common/hooks'

enum AnnotationValue {
  ChangedFromState = 'ChangedFromState'
}

const isChangedFromState = (transation: Transaction): boolean =>
  transation.annotation(StringAnnotation) === AnnotationValue.ChangedFromState

let updateInputTimeoutId: number | undefined

const inputUpdateListener: ViewUpdateListener = viewUpdate => {
  if (!viewUpdate.docChanged) {
    return
  }
  // doc changes must be caused by at least one transaction
  const firstTransaction = viewUpdate.transactions[0]
  const input = viewUpdate.state.doc.sliceString(0)
  window.clearTimeout(updateInputTimeoutId)
  updateInputTimeoutId = window.setTimeout(() => {
    // only one transaction is dispatched if input is set from file
    if (!isChangedFromState(firstTransaction)) {
      dispatch(setEditorInput({ value: input }))
    }
    if (selectAutoAssemble(getState())) {
      assemble(input)
    }
  }, 250)
}

export const useCodeMirror = (): ReturnType<typeof __useCodeMirror> => {
  const defaultInput = useConstant(() => selectEditortInput(getState()))

  const { view, editorRef } = __useCodeMirror<HTMLDivElement>(
    {
      doc: defaultInput,
      extensions: setup
    },
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
            to: view.state.doc.sliceString(0).length,
            insert: value
          },
          annotations: StringAnnotation.of(AnnotationValue.ChangedFromState)
        })
      }
    })
  }, [view])

  return { view, editorRef }
}

const breakpointsUpdateListener: ViewUpdateListener = viewUpdate => {
  if (viewUpdate.docChanged) {
    if (breakpointsChanged(viewUpdate)) {
      const breakpointRangeSet = getBreakpoints(viewUpdate.state)
      const breakpoints = mapRangeSetToArray(breakpointRangeSet, (_, from) =>
        lineRangeAt(viewUpdate.state.doc, from)
      )
      dispatch(setBreakpoints(breakpoints))
    }
  } else {
    const transaction = viewUpdate.transactions[0] as Transaction | undefined
    if (transaction === undefined || isChangedFromState(transaction)) {
      return
    }
    transaction.effects.forEach(effect => {
      if (effect.is(breakpointEffect)) {
        const actionCreator = effect.value.on ? addBreakpoint : removeBreakpoint
        const lineRange = lineRangeAt(viewUpdate.state.doc, effect.value.pos)
        dispatch(actionCreator(lineRange))
      }
    })
  }
}

export const useBreakpoints = (view: EditorView | undefined): void => {
  useEffect(() => {
    if (view === undefined) {
      return
    }
    view.dispatch({
      effects: StateEffect.appendConfig.of(EditorView.updateListener.of(breakpointsUpdateListener))
    })
    const breakpoints = selectEditorBreakpoints(getState())
    // persisted state might not be in sync with codemirror
    const validBreakpoints = breakpoints.filter(
      lineRange =>
        lineRange.to <= view.state.doc.length &&
        lineRangesEqual(lineRange, lineRangeAt(view.state.doc, lineRange.from))
    )
    if (validBreakpoints.length < breakpoints.length) {
      dispatch(setBreakpoints(validBreakpoints))
    }
    view.dispatch({
      effects: validBreakpoints.map(lineRange =>
        breakpointEffect.of({
          pos: lineRange.from,
          on: true
        })
      ),
      annotations: StringAnnotation.of(AnnotationValue.ChangedFromState)
    })
  }, [view])
}

export const useHighlightActiveLine = (view: EditorView | undefined): void => {
  const activeLinePos = useSelector(selectEditorActiveLinePos(view))

  useEffect(() => {
    view?.dispatch({
      effects: highlightLineEffect.of({ addPos: activeLinePos }),
      ...(view.hasFocus || activeLinePos === undefined
        ? undefined
        : {
            selection: { anchor: activeLinePos[0] },
            scrollIntoView: true
          })
    })
  }, [view, activeLinePos])
}

export const useUnderlineAssemblerError = (view: EditorView | undefined): void => {
  const assemblerErrorRange = useSelector(selectAssemblerErrorRange)

  useEffect(() => {
    view?.dispatch({
      effects: wavyUnderlineEffect.of({ add: assemblerErrorRange })
    })
  }, [view, assemblerErrorRange])
}

export enum MessageType {
  Error = 'Error',
  Info = 'Info'
}

interface StatusMessage {
  readonly type: MessageType
  readonly content: string
}

export const useStatusMessage = (): StatusMessage | null => {
  const assemblerError = useSelector(selectAssemblerError)
  const cpuFault = useSelector(selectCpuFault)

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

  return assemblerError !== null
    ? {
        type: MessageType.Error,
        content: `${assemblerError.type}: ${assemblerError.message}`
      }
    : cpuFault !== null
    ? {
        type: MessageType.Error,
        content: `RuntimeError: ${cpuFault}`
      }
    : shouldShowHalted
    ? {
        type: MessageType.Info,
        content: 'Info: Program has halted.'
      }
    : null
}
