import React, { useEffect } from 'react'
import EditorStatus from './EditorStatus'
import { useAppSelector, useAppStore } from '../../app/hooks'
import { setEditorInput, selectEditortInput, selectEditorActiveRange } from './editorSlice'
import { useCodeMirror } from './codemirror/hooks'
import { setup } from './codemirror/setup'
import { highlightActiveRangeEffect } from './codemirror/highlightActiveRange'
import { useAssembler } from '../assembler/hooks'
import { selectAutoAssemble } from '../controller/controllerSlice'
// import { breakpointEffect } from './codemirror/breakpointGutter'

let timeoutId: number

interface Props {
  className?: string
}

const Editor = ({ className }: Props): JSX.Element => {
  const store = useAppStore()
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

  // TODO: ActiveRange | undefined
  const activeRange = useAppSelector(selectEditorActiveRange)

  view?.dispatch({
    ...(view.hasFocus || activeRange === null
      ? undefined
      : { selection: { anchor: activeRange.from } }),
    effects: highlightActiveRangeEffect.of({ add: activeRange ?? undefined }),
    scrollIntoView: true
  })

  return (
    <div ref={editorRef} className={`flex flex-col ${className}`}>
      <EditorStatus />
    </div>
  )
}

export default Editor
