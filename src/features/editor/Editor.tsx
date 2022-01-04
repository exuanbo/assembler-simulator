import React, { useState, useEffect } from 'react'
import EditorStatus from './EditorStatus'
import { useSelector, useStore } from '../../app/hooks'
import { addActionListener } from '../../app/actionListener'
import {
  selectEditortInput,
  selectEditorBreakpoints,
  selectEditorActiveLinePos,
  setEditorInput,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint
} from './editorSlice'
import { useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'
import { breakpointEffect, getBreakpoints, breakpointsChanged } from './codemirror/breakpoints'
import { wavyUnderlineEffect } from './codemirror/wavyUnderline'
import { highlightLineEffect } from './codemirror/highlightActiveRange'
import { lineRangeAt, lineRangesEqual } from './codemirror/line'
import { mapRangeSetToArray } from './codemirror/rangeSet'
import { useAssembler } from '../assembler/hooks'
import { selectAssemblerErrorRange } from '../assembler/assemblerSlice'
import { selectAutoAssemble } from '../controller/controllerSlice'

let syncStateTimeoutId: number | undefined

interface Props {
  className: string
}

const Editor = ({ className }: Props): JSX.Element => {
  const { getState, dispatch } = useStore()
  const [defaultInput] = useState(() => selectEditortInput(getState()))
  const assemble = useAssembler(dispatch)

  const { view, editorRef } = useCodeMirror<HTMLDivElement>(
    {
      doc: defaultInput,
      extensions: setup
    },
    viewUpdate => {
      if (viewUpdate.docChanged) {
        const input = viewUpdate.state.doc.sliceString(0)
        window.clearTimeout(syncStateTimeoutId)
        syncStateTimeoutId = window.setTimeout(() => {
          const state = getState()
          if (selectEditortInput(state) !== input) {
            dispatch(
              setEditorInput({
                value: input,
                isFromFile: false
              })
            )
          }
          if (selectAutoAssemble(state)) {
            assemble(input)
          }
        }, 200)

        if (breakpointsChanged(viewUpdate)) {
          const breakpointRangeSet = getBreakpoints(viewUpdate.state)
          const breakpoints = mapRangeSetToArray(breakpointRangeSet, (_, from) =>
            lineRangeAt(viewUpdate.state.doc, from)
          )
          dispatch(setBreakpoints(breakpoints))
        }
      } else {
        viewUpdate.transactions.forEach(transaction => {
          transaction.effects.forEach(effect => {
            if (effect.is(breakpointEffect)) {
              const actionCreator = effect.value.on ? addBreakpoint : removeBreakpoint
              const lineRange = lineRangeAt(viewUpdate.state.doc, effect.value.pos)
              dispatch(actionCreator(lineRange))
            }
          })
        })
      }
    }
  )

  useEffect(() => {
    if (selectAutoAssemble(getState())) {
      assemble(defaultInput)
    }
  }, [])

  useEffect(() => {
    if (view === undefined) {
      return
    }
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
      effects: breakpoints.map(lineRange =>
        breakpointEffect.of({
          pos: lineRange.from,
          on: true
        })
      )
    })
    return addActionListener(setEditorInput, ({ value, isFromFile = false }) => {
      if (isFromFile) {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.sliceString(0).length,
            insert: value
          }
        })
      }
    })
  }, [view])

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

  const assemblerErrorRange = useSelector(selectAssemblerErrorRange)

  useEffect(() => {
    view?.dispatch({
      effects: wavyUnderlineEffect.of({ add: assemblerErrorRange })
    })
  }, [view, assemblerErrorRange])

  return (
    <div ref={editorRef} className={`flex flex-col ${className}`}>
      <EditorStatus />
    </div>
  )
}

export default Editor
