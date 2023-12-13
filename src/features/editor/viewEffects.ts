import type { Transaction } from '@codemirror/state'
import { addUpdateListener } from '@codemirror-toolkit/extensions'
import type { ViewEffectCallback } from '@codemirror-toolkit/react'
import { mapRangeSetToArray, rangeSetsEqual } from '@codemirror-toolkit/utils'
import { debounceTime, filter, identity, map, of, switchMap } from 'rxjs'

import { store } from '@/app/store'
import { UPDATE_TIMEOUT_MS } from '@/common/constants'
import * as Maybe from '@/common/maybe'
import { observe } from '@/common/observe'
import { curryRight2 } from '@/common/utils'
import {
  clearAssemblerError,
  selectAssemblerError,
  selectAssemblerErrorRange,
} from '@/features/assembler/assemblerSlice'
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
  clearEditorHighlightRange,
  removeBreakpoint,
  selectEditorBreakpoints,
  selectEditorHighlightLinePos,
  setBreakpoints,
  setEditorInput,
} from './editorSlice'
import { isTemplate, templateSelection } from './examples'

const defineViewEffect = identity<ViewEffectCallback>

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
      map((spec) => syncFromState(spec)),
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

const syncAssemblerErrorFromState = defineViewEffect((view) => {
  const assemblerErrorRange$ = store.onState(selectAssemblerErrorRange)
  return observe(
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
})

const clearAssemblerErrorOnInput = defineViewEffect((view) => {
  const viewUpdate$ = onUpdate(view)
  return observe(
    viewUpdate$.pipe(
      filter((update) => update.docChanged),
      filter(() => !!store.getState(selectAssemblerError)),
      map(() => clearAssemblerError()),
    ),
    (action) => store.dispatch(action),
  )
})

const syncHighlightLineFromState = defineViewEffect((view) => {
  const highlightLinePos$ = store.onState(curryRight2(selectEditorHighlightLinePos)(view))
  return observe(highlightLinePos$, (linePos_M) => {
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
})

const clearHighlightLineOnLoadFile = defineViewEffect(() => {
  const setEditorInput$ = store.onAction(setEditorInput)
  return observe(
    setEditorInput$.pipe(
      filter(({ isFromFile }) => isFromFile),
      map(() => clearEditorHighlightRange()),
    ),
    (action) => store.dispatch(action),
  )
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

export const viewEffects: readonly ViewEffectCallback[] = [
  toggleVimKeybindings,
  syncInputToState,
  syncInputFromState,
  autoSelectTemplateTitle,
  syncAssemblerErrorFromState,
  clearAssemblerErrorOnInput,
  syncHighlightLineFromState,
  clearHighlightLineOnLoadFile,
  syncBreakpointsToState,
  initialSyncBreakpointsFromState,
]
