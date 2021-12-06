import React, { useState, useEffect } from 'react'
import EditorStatus from './EditorStatus'
import { useSelector, useShallowEqualSelector, useStore } from '../../app/hooks'
import { subscribeAction } from '../../app/sideEffect'
import {
  setEditorInput,
  addBreakpoint,
  removeBreakpoint,
  selectEditortInput,
  selectEditorActiveRange
} from './editorSlice'
import { useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'
import { breakpointEffect } from './codemirror/breakpoints'
import { wavyUnderlineEffect } from './codemirror/wavyUnderline'
import { highlightActiveRangeEffect } from './codemirror/highlightActiveRange'
import { selectAssemblerErrorRange } from '../assembler/assemblerSlice'
import { useAssembler } from '../assembler/hooks'
import { selectAutoAssemble } from '../controller/controllerSlice'

let timeoutId: number

interface Props {
  className?: string
}

const Editor = ({ className }: Props): JSX.Element => {
  const { getState, dispatch } = useStore()
  const [defaultInput] = useState(() => selectEditortInput(getState()))
  const assemble = useAssembler()

  const { view, editorRef } = useCodeMirror<HTMLDivElement>(
    {
      doc: defaultInput,
      extensions: setup
    },
    viewUpdate => {
      if (viewUpdate.docChanged) {
        const input = viewUpdate.state.doc.sliceString(0)
        window.clearTimeout(timeoutId)
        timeoutId = window.setTimeout(() => {
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
      }
      viewUpdate.transactions.forEach(transaction => {
        transaction.effects.forEach(effect => {
          if (effect.is(breakpointEffect)) {
            const actionCreator = effect.value.on ? addBreakpoint : removeBreakpoint
            const line = viewUpdate.state.doc.lineAt(effect.value.pos)
            const lineRange = (({ from, to }) => ({ from, to }))(line)
            dispatch(actionCreator(lineRange))
          }
        })
      })
    }
  )

  useEffect(() => {
    assemble(defaultInput)
  }, [])

  useEffect(() => {
    return subscribeAction(setEditorInput, ({ value, isFromFile = false }) => {
      if (isFromFile) {
        view?.dispatch({
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
  const assemblerErrorRange = useShallowEqualSelector(selectAssemblerErrorRange)

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
