import React, { useEffect } from 'react'
import EditorStatus from './EditorStatus'
import { useSelector, useShallowEqualSelector, useStore } from '../../app/hooks'
import { setEditorInput, selectEditortInput, selectEditorActiveRange } from './editorSlice'
import { useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'
import { wavyUnderlineEffect } from './codemirror/wavyUnderline'
import { highlightActiveRangeEffect } from './codemirror/highlightActiveRange'
import { selectAssemblerError } from '../assembler/assemblerSlice'
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

  useEffect(() => {
    assemble(defaultInput)
  }, [])

  const { editorRef, view } = useCodeMirror<HTMLDivElement>(
    {
      doc: defaultInput,
      extensions: setup
    },
    viewUpdate => {
      if (viewUpdate.docChanged) {
        const input = viewUpdate.state.doc.sliceString(0)
        window.clearTimeout(timeoutId)
        timeoutId = window.setTimeout(() => {
          store.dispatch(setEditorInput(input))
          if (selectAutoAssemble(store.getState())) {
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

  const assemblerError = useShallowEqualSelector(selectAssemblerError)
  const activeRange = useSelector(selectEditorActiveRange)

  if (view !== undefined) {
    view.dispatch({
      effects: [
        wavyUnderlineEffect.of({
          add:
            assemblerError?.range == null
              ? undefined
              : {
                  from: assemblerError.range[0],
                  to: assemblerError.range[1]
                },
          filter: () => false
        }),
        highlightActiveRangeEffect.of({
          add: activeRange,
          filter: () => false
        })
      ],
      ...(view.hasFocus || activeRange === undefined
        ? undefined
        : {
            selection: { anchor: activeRange.from },
            scrollIntoView: true
          })
    })
  }

  return (
    <div ref={editorRef} className={`flex flex-col ${className}`}>
      <EditorStatus />
    </div>
  )
}

export default Editor
