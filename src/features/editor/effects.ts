import type { Transaction } from '@codemirror/state'
import { addUpdateListener } from '@codemirror-toolkit/extensions'
import { defineViewEffect } from '@codemirror-toolkit/react'
import { mapRangeSetToArray, rangeSetsEqual } from '@codemirror-toolkit/utils'
import { debounceTime, filter, map, of, switchMap } from 'rxjs'

import { store } from '@/app/store'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'
import * as Maybe from '@/common/maybe'
import { observe } from '@/common/observe'
import { curryRight2 } from '@/common/utils'
import { resetAssemblerState, selectAssemblerErrorRange } from '@/features/assembler/assemblerSlice'
import { selectVimKeybindings } from '@/features/controller/controllerSlice'

import { hasStringAnnotation, withStringAnnotation } from './codemirror/annotations'
import { BreakpointEffect, getBreakpointMarkers } from './codemirror/breakpoints'
import { HighlightLineEffect } from './codemirror/highlightLine'
import { onUpdate } from './codemirror/observable'
import { replaceContent } from './codemirror/state'
import { lineLocAt, lineRangesEqual } from './codemirror/text'
import { disableVim, enableVim, initVim$ } from './codemirror/vim'
import { WavyUnderlineEffect } from './codemirror/wavyUnderline'
import {
  addBreakpoint,
  removeBreakpoint,
  selectEditorBreakpoints,
  setBreakpoints,
  setEditorInput,
} from './editorSlice'
import { isTemplate, templateSelection } from './examples'
import { selectCurrentStatementLinePos } from './selectors'

const resetAssemblerStateOnInput = defineViewEffect((view) => {
  const viewUpdate$ = onUpdate(view)
  return observe(
    viewUpdate$.pipe(
      filter((update) => update.docChanged),
      map(() => resetAssemblerState()),
    ),
    (action) => store.dispatch(action),
  )
})

enum AnnotationValue {
  SyncFromState = 'SyncFromState',
}

const syncFromState = withStringAnnotation(AnnotationValue.SyncFromState)
const isSyncFromState = hasStringAnnotation(AnnotationValue.SyncFromState)

const syncInputToState = defineViewEffect((view) => {
  const viewUpdate$ = onUpdate(view)
  return observe(
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
})

const syncInputFromState = defineViewEffect((view) => {
  const setEditorInput$ = store.onAction(setEditorInput)
  return observe(
    setEditorInput$.pipe(
      filter(({ value }) => value !== view.state.doc.toString()),
      map(({ value }) => replaceContent(view.state, value)),
      map((transaction) => syncFromState(transaction)),
    ),
    (transaction) => view.dispatch(transaction),
  )
})

const autoSelectTemplateTitle = defineViewEffect((view) => {
  const setEditorInput$ = store.onAction(setEditorInput)
  return observe(
    setEditorInput$.pipe(
      filter(({ isFromFile }) => isFromFile),
      filter(({ value }) => isTemplate(value)),
      map(() => ({ selection: templateSelection })),
    ),
    (transaction) => (view.focus(), view.dispatch(transaction)),
  )
})

const underlineAssemblerError = defineViewEffect((view) => {
  const assemblerErrorRange$ = store.onState(selectAssemblerErrorRange)
  return observe(
    assemblerErrorRange$.pipe(
      map(Maybe.fromNullable),
      map((maybeRange) =>
        WavyUnderlineEffect.of({
          range: maybeRange,
          filter: () => maybeRange.isJust(),
        }),
      ),
      map((effect) => ({ effects: effect })),
    ),
    (transaction) => view.dispatch(transaction),
  )
})

const highlightLineWithStatement = defineViewEffect((view) => {
  const statementLinePos$ = store.onState(curryRight2(selectCurrentStatementLinePos)(view))
  return observe(statementLinePos$, (maybeLinePos) => {
    maybeLinePos
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

    maybeLinePos
      .filter(() => !view.hasFocus)
      .map((linePos) => ({
        // length of `linePos` is already checked
        selection: { anchor: linePos[0] },
        scrollIntoView: true,
      }))
      .ifJust((transaction) => view.dispatch(transaction))
  })
})

const syncBreakpointsToState = defineViewEffect((view) => {
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
})

const initialSyncBreakpointsFromState = defineViewEffect((view) => {
  const breakpoints = store.getState(selectEditorBreakpoints)
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
})

const toggleVimKeybindings = defineViewEffect((view) => {
  const vimKeybindings$ = store.onState(selectVimKeybindings)
  return observe(
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
})

const setups = [
  resetAssemblerStateOnInput,
  syncInputToState,
  syncInputFromState,
  autoSelectTemplateTitle,
  underlineAssemblerError,
  highlightLineWithStatement,
  syncBreakpointsToState,
  initialSyncBreakpointsFromState,
  toggleVimKeybindings,
]

export const effects = defineViewEffect((view) => {
  const cleanups = setups.map((effect) => effect(view))
  return () => cleanups.forEach((cleanup) => cleanup?.())
})
