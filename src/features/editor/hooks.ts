import type { Transaction } from '@codemirror/state'
import { addUpdateListener } from '@codemirror-toolkit/extensions'
import { mapRangeSetToArray, rangeSetsEqual } from '@codemirror-toolkit/utils'
import { useEffect } from 'react'
import { debounceTime, filter, first, map, merge, of, switchMap, tap, timer } from 'rxjs'

import { applySelector, useSelector } from '@/app/selector'
import { store } from '@/app/store'
import { subscribe } from '@/app/subscribe'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'
import * as Maybe from '@/common/maybe'
import { curryRight2 } from '@/common/utils'
import { assemble as assembleFrom } from '@/features/assembler/assemble'
import {
  clearAssemblerError,
  selectAssemblerError,
  selectAssemblerErrorRange,
} from '@/features/assembler/assemblerSlice'
import { selectAutoAssemble, selectVimKeybindings } from '@/features/controller/controllerSlice'
import { resetCpuState, selectCpuFault, setCpuHalted } from '@/features/cpu/cpuSlice'

import { hasStringAnnotation, withStringAnnotation } from './codemirror/annotations'
import { BreakpointEffect, getBreakpointMarkers } from './codemirror/breakpoints'
import { HighlightLineEffect } from './codemirror/highlightLine'
import { useViewEffect } from './codemirror/react'
import { onUpdate } from './codemirror/rx'
import { replaceContent } from './codemirror/state'
import { lineLocAt, lineRangesEqual } from './codemirror/text'
import { disableVim, enableVim, initVim$ } from './codemirror/vim'
import { WavyUnderlineEffect } from './codemirror/wavyUnderline'
import {
  addBreakpoint,
  clearEditorHighlightRange,
  clearEditorMessage,
  type EditorMessage,
  MessageType,
  removeBreakpoint,
  selectEditorBreakpoints,
  selectEditorHighlightLinePos,
  selectEditorMessage,
  setBreakpoints,
  setEditorInput,
  setEditorMessage,
} from './editorSlice'
import { isTemplate, templateSelection } from './examples'

export const useVimKeybindings = (): void => {
  useViewEffect((view) => {
    const vimKeybindings$ = store.onState(selectVimKeybindings)
    return subscribe(
      vimKeybindings$.pipe(
        switchMap((shouldEnable) => {
          if (shouldEnable) {
            return initVim$.pipe(map(() => enableVim))
          }
          return of(disableVim)
        }),
      ),
      (action) => action(view),
    )
  }, [])
}

enum AnnotationValue {
  SyncFromState = 'SyncFromState',
}

const syncFromState = withStringAnnotation(AnnotationValue.SyncFromState)
const isSyncFromState = hasStringAnnotation(AnnotationValue.SyncFromState)

export const useSyncInput = (): void => {
  useViewEffect((view) => {
    const viewUpdate$ = onUpdate(view)
    return subscribe(
      viewUpdate$.pipe(
        filter((update) => update.docChanged),
        debounceTime(UPDATE_TIMEOUT_MS),
        filter((update) => {
          // only consider the first transaction
          const transaction = update.transactions[0] as Transaction | undefined
          return !transaction || !isSyncFromState(transaction)
        }),
        map((update) => update.state.doc.toString()),
        map((value) => setEditorInput({ value })),
      ),
      (action) => store.dispatch(action),
    )
  }, [])

  useViewEffect((view) => {
    const setEditorInput$ = store.onAction(setEditorInput)
    return subscribe(
      setEditorInput$.pipe(
        filter(({ isFromFile }) => isFromFile),
        map(({ value }) => replaceContent(view.state, value)),
        map((spec) => syncFromState(spec)),
      ),
      (transaction) => view.dispatch(transaction),
    )
  }, [])
}

export const useAutoFocus = (): void => {
  useViewEffect((view) => {
    const setEditorInput$ = store.onAction(setEditorInput)
    return subscribe(
      setEditorInput$.pipe(
        filter(({ isFromFile }) => isFromFile),
        filter(({ value }) => isTemplate(value)),
        tap(() => view.focus()),
        map(() => ({ selection: templateSelection })),
      ),
      (transaction) => view.dispatch(transaction),
    )
  }, [])
}

export const useAutoAssemble = (): void => {
  useViewEffect((view) => {
    const initialAssemble$ = timer(UPDATE_TIMEOUT_MS)
    return subscribe(
      initialAssemble$.pipe(
        filter(() => applySelector(selectAutoAssemble)),
        map(() => view.state.doc.toString()),
      ),
      assembleFrom,
    )
  }, [])

  useEffect(() => {
    const setEditorInput$ = store.onAction(setEditorInput)
    return subscribe(
      setEditorInput$.pipe(
        filter(() => applySelector(selectAutoAssemble)),
        switchMap(({ value, isFromFile }) => {
          if (isFromFile) {
            return timer(UPDATE_TIMEOUT_MS).pipe(map(() => value))
          }
          return of(value)
        }),
      ),
      assembleFrom,
    )
  }, [])
}

export const useAssemblerError = (): void => {
  useViewEffect((view) => {
    const viewUpdate$ = onUpdate(view)
    return subscribe(
      viewUpdate$.pipe(
        filter((update) => update.docChanged),
        filter(() => !!applySelector(selectAssemblerError)),
        map(() => clearAssemblerError()),
      ),
      (action) => store.dispatch(action),
    )
  }, [])

  useViewEffect((view) => {
    const assemblerErrorRange$ = store.onState(selectAssemblerErrorRange)
    return subscribe(
      assemblerErrorRange$.pipe(
        map(Maybe.fromNullable),
        map((range_M) =>
          WavyUnderlineEffect.of({
            range: range_M,
            filter: () => range_M.isJust(),
          }),
        ),
        map((effect) => ({ effects: effect })),
      ),
      (transaction) => view.dispatch(transaction),
    )
  }, [])
}

export const useHighlightLine = (): void => {
  useEffect(() => {
    const setEditorInput$ = store.onAction(setEditorInput)
    return subscribe(
      setEditorInput$.pipe(
        filter(({ isFromFile }) => isFromFile),
        map(() => clearEditorHighlightRange()),
      ),
      (action) => store.dispatch(action),
    )
  }, [])

  useViewEffect((view) => {
    const highlightLinePos$ = store.onState(curryRight2(selectEditorHighlightLinePos)(view))
    return subscribe(highlightLinePos$, (linePos_M) => {
      linePos_M
        .map((linePos) =>
          linePos.map((pos, posIndex) =>
            HighlightLineEffect.of({
              pos: Maybe.Just(pos),
              // clear previous decorations on first line
              filter: () => posIndex !== 0,
            }),
          ),
        )
        .altLazy(() =>
          Maybe.Just([
            HighlightLineEffect.of({
              pos: Maybe.Nothing,
              filter: () => false,
            }),
          ]),
        )
        .map((effects) => ({ effects }))
        .ifJust((transaction) => view.dispatch(transaction))

      linePos_M
        .filter(() => !view.hasFocus)
        .map((linePos) => ({
          // length of `linePos` is already checked
          selection: { anchor: linePos[0] },
          scrollIntoView: true,
        }))
        .ifJust((transaction) => view.dispatch(transaction))
    })
  }, [])
}

export const useBreakpoints = (): void => {
  useViewEffect((view) => {
    return addUpdateListener(view, (update) => {
      if (update.docChanged) {
        const breakpointMarkers = getBreakpointMarkers(update.state)
        if (!rangeSetsEqual(breakpointMarkers, getBreakpointMarkers(update.startState))) {
          const breakpoints = mapRangeSetToArray(breakpointMarkers, (_, from) =>
            lineLocAt(update.state.doc, from),
          )
          store.dispatch(setBreakpoints(breakpoints))
        }
      } else {
        // only consider the first transaction
        const transaction = update.transactions[0] as Transaction | undefined
        if (!transaction || isSyncFromState(transaction)) {
          return
        }
        transaction.effects.forEach((effect) => {
          if (effect.is(BreakpointEffect)) {
            const actionCreator = effect.value.on ? addBreakpoint : removeBreakpoint
            const lineLoc = lineLocAt(update.state.doc, effect.value.pos)
            store.dispatch(actionCreator(lineLoc))
          }
        })
      }
    })
  }, [])

  useViewEffect((view) => {
    const breakpoints = applySelector(selectEditorBreakpoints)
    // persisted state might not be in sync with codemirror
    const validBreakpoints = breakpoints.filter(
      (lineLoc) =>
        lineLoc.to <= view.state.doc.length &&
        lineRangesEqual(lineLoc, lineLocAt(view.state.doc, lineLoc.from)),
    )
    if (validBreakpoints.length < breakpoints.length) {
      store.dispatch(setBreakpoints(validBreakpoints))
    }
    if (validBreakpoints.length === 0) {
      return
    }
    const breakpointMarkers = getBreakpointMarkers(view.state)
    if (breakpointMarkers.size === 0) {
      view.dispatch(
        syncFromState({
          effects: validBreakpoints.map((lineLoc) =>
            BreakpointEffect.of({
              pos: lineLoc.from,
              on: true,
            }),
          ),
        }),
      )
    }
  }, [])
}

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
    return subscribe(
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
    return subscribe(
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
