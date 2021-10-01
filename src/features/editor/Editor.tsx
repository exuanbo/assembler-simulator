import React, { useEffect } from 'react'
import EditorStatus from './EditorStatus'
import { useSelector, useShallowEqualSelector, useStore } from '../../app/hooks'
import { subscribe } from '../../app/sideEffect'
import { setEditorInput, selectEditortInput, selectEditorActiveRange } from './editorSlice'
import { useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'
import { wavyUnderlineEffect } from './codemirror/wavyUnderline'
import { highlightActiveRangeEffect } from './codemirror/highlightActiveRange'
import { selectAssemblerErrorRange } from '../assembler/assemblerSlice'
import { useAssembler } from '../assembler/hooks'
import { selectAutoAssemble } from '../controller/controllerSlice'
// import { breakpointEffect } from './codemirror/breakpointGutter'

let timeoutId: number

interface Props {
  className?: string
}

const Editor = ({ className }: Props): JSX.Element => {
  const store = useStore()
  const defaultInput = selectEditortInput(store.getState())
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
          const state = store.getState()
          if (selectEditortInput(state) !== input) {
            store.dispatch(
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
      // TODO: handle breakpoint
      // viewUpdate.transactions.forEach(transaction => {
      //   transaction.effects.forEach(effect => {
      //     if (effect.is(breakpointEffect)) {
      //       const actionCreator = effect.value.on ? addBreakpoint : removeBreakpoint
      //       const lineNumber = viewUpdate.state.doc.lineAt(effect.value.pos).number
      //       dispatch(actionCreator(lineNumber))
      //     }
      //   })
      // })
    }
  )

  useEffect(() => {
    // TODO: remove first assemble
    assemble(defaultInput)
    subscribe(setEditorInput, ({ value, isFromFile = false }) => {
      if (!isFromFile) {
        return
      }
      view!.dispatch({
        changes: {
          from: 0,
          to: view!.state.doc.sliceString(0).length,
          insert: value
        }
      })
    })
  }, [])

  const assemblerErrorRange = useShallowEqualSelector(selectAssemblerErrorRange)
  const activeRange = useSelector(selectEditorActiveRange)

  view?.dispatch({
    effects: [
      wavyUnderlineEffect.of({ add: assemblerErrorRange }),
      highlightActiveRangeEffect.of({ add: activeRange })
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
