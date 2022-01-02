import React, { useState, useEffect } from 'react'
import EditorStatus from './EditorStatus'
import { useSelector, useStore } from '../../app/hooks'
import { addActionListener } from '../../app/actionListener'
import {
  selectEditortInput,
  selectEditorBreakpoints,
  selectEditorActiveRange,
  setEditorInput,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint
} from './editorSlice'
import { useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'
import { breakpointEffect, getBreakpoints, breakpointsEqual } from './codemirror/breakpoints'
import { wavyUnderlineEffect } from './codemirror/wavyUnderline'
import { highlightActiveRangeEffect } from './codemirror/highlightActiveRange'
import { lineRangeAt, lineRangesEqual } from './codemirror/line'
import { mapRangeSetToArray } from './codemirror/rangeSet'
import { selectAssemblerErrorRange } from '../assembler/assemblerSlice'
import { useAssembler } from '../assembler/hooks'
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

        const breakpointRangeSet = getBreakpoints(viewUpdate.state)
        if (!breakpointsEqual(breakpointRangeSet, getBreakpoints(viewUpdate.startState))) {
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
    const breakpoints = selectEditorBreakpoints(getState()).filter(lineRange => {
      const isValid =
        lineRange.to <= view.state.doc.length &&
        lineRangesEqual(lineRange, lineRangeAt(view.state.doc, lineRange.from))
      if (!isValid) {
        dispatch(removeBreakpoint(lineRange))
      }
      return isValid
    })
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

  const activeRange = useSelector(selectEditorActiveRange)
  const assemblerErrorRange = useSelector(selectAssemblerErrorRange)

  view?.dispatch({
    effects: [
      highlightActiveRangeEffect.of({ add: activeRange }),
      wavyUnderlineEffect.of({ add: assemblerErrorRange })
    ],
    ...(view.hasFocus || activeRange === undefined
      ? undefined
      : {
          selection: { anchor: activeRange.from },
          scrollIntoView: true
        })
  })

  return (
    <div ref={editorRef} className={`flex flex-col ${className}`}>
      <EditorStatus />
    </div>
  )
}

export default Editor
